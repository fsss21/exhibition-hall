const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

/**
 * Конфигурация сервера — проект «Зал временных выставок» (exhibition-hall)
 * React + Vite, данные в public/data/: currentExhibition.json, progressPoints.json, archive.json, mainMenu.json
 */
const CONFIG = {
  // Порт сервера (не конфликтует с Vite dev 5173/5174)
  port: 3001,

  // Режим kiosk (полноэкранный режим)
  kioskMode: false,

  // Автоматически открывать браузер при запуске
  openBrowser: true,

  // Отключить проверку CORS в браузере (только для локальной разработки)
  disableWebSecurity: true,

  // Задержка перед открытием браузера (мс)
  browserDelay: 1000,

  // Путь к index.html (сборка Vite → build/)
  indexHtmlPath: 'index.html',

  // Файлы данных проекта (относительно public/ или build/data/)
  // Текущая выставка: концепция, каталог экспонатов
  gameItemsFile: path.join('data', 'currentExhibition.json'),
  // Точки прогресса для страницы «История Уткиной дачи» (SubMenu)
  statisticsFile: path.join('data', 'progressPoints.json'),
  // Главное меню (кнопки на главной)
  sectionsFile: path.join('data', 'mainMenu.json'),
  // Архив выставок (прошедшие и будущие проекты) — опционально для API
  archiveFile: path.join('data', 'archive.json'),
};

/**
 * Класс для управления настройками и запуском сервера
 * Поддерживает как обычный запуск через node, так и сборку через pkg
 */
class ServerSetup {
  constructor() {
    try {
      // Корень проекта exhibition-hall: __dirname = src/server/utils → вверх 3 уровня
      this.isPkg = typeof process.pkg !== 'undefined';
      this.baseDir = this.isPkg ? path.dirname(process.execPath) : path.join(__dirname, '..', '..', '..');

      this.config = {
        port: CONFIG.port,
        kioskMode: CONFIG.kioskMode,
        openBrowser: CONFIG.openBrowser,
        disableWebSecurity: CONFIG.disableWebSecurity,
        browserDelay: CONFIG.browserDelay,
        indexHtmlPath: CONFIG.indexHtmlPath,
        gameItemsFile: CONFIG.gameItemsFile,
        statisticsFile: CONFIG.statisticsFile,
        sectionsFile: CONFIG.sectionsFile,
        archiveFile: CONFIG.archiveFile,
      };

      if (!this.config.gameItemsFile || !this.config.statisticsFile) {
        throw new Error(`CONFIG не инициализирован. gameItemsFile: ${this.config.gameItemsFile}, statisticsFile: ${this.config.statisticsFile}`);
      }

      // Директория со сборкой: Vite → build/
      // В pkg: раздаём статику из текущей рабочей директории (откуда запустили exe),
      // чтобы index.html искался в папке, где лежит exe или куда пользователь перешёл (cd build).
      if (this.isPkg) {
        this.buildDir = process.cwd();
      } else {
        this.buildDir = path.join(this.baseDir, 'build');
      }

      if (this.isPkg) {
        this.gameItemsFile = path.join(this.baseDir, this.config.gameItemsFile);
        this.statisticsFile = path.join(this.baseDir, this.config.statisticsFile);
        this.sectionsFile = path.join(this.baseDir, this.config.sectionsFile);
        this.archiveFile = path.join(this.baseDir, this.config.archiveFile);
        this.gameItemsFileFallback = null;
        this.statisticsFileFallback = null;
        this.sectionsFileFallback = null;
        this.archiveFileFallback = null;
      } else {
        const buildData = (name) => path.join(this.buildDir, this.config[name]);
        const publicData = (name) => path.join(this.baseDir, 'public', this.config[name]);

        this.gameItemsFile = buildData('gameItemsFile');
        this.gameItemsFileFallback = publicData('gameItemsFile');
        this.statisticsFile = buildData('statisticsFile');
        this.statisticsFileFallback = publicData('statisticsFile');
        this.sectionsFile = buildData('sectionsFile');
        this.sectionsFileFallback = publicData('sectionsFile');
        this.archiveFile = buildData('archiveFile');
        this.archiveFileFallback = publicData('archiveFile');
      }

      this.getGameItemsFile = this.getGameItemsFile.bind(this);
      this.getStatisticsFile = this.getStatisticsFile.bind(this);
      this.getSectionsFile = this.getSectionsFile.bind(this);
      this.getArchiveFile = this.getArchiveFile.bind(this);

      this.indexHtmlExists = false;
    } catch (error) {
      console.error('❌ Ошибка в конструкторе ServerSetup:', error);
      throw error;
    }
  }

  getBaseDir() {
    return this.baseDir;
  }

  getBuildDir() {
    return this.buildDir;
  }

  async _resolveDataFile(primary, fallback, label) {
    try {
      if (this.isPkg) {
        if (!primary) throw new Error(`${label} не определен в pkg режиме`);
        return primary;
      }
      if (!primary) throw new Error(`${label} не определен`);
      if (typeof fs.pathExists !== 'function') return primary;
      const buildExists = await fs.pathExists(primary);
      if (buildExists) return primary;
      if (fallback) {
        const publicExists = await fs.pathExists(fallback);
        if (publicExists) return fallback;
      }
      return primary;
    } catch (error) {
      console.error(`❌ Ошибка в ${label}:`, error);
      throw error;
    }
  }

  async getGameItemsFile() {
    return this._resolveDataFile(this.gameItemsFile, this.gameItemsFileFallback, 'getGameItemsFile');
  }

  async getStatisticsFile() {
    return this._resolveDataFile(this.statisticsFile, this.statisticsFileFallback, 'getStatisticsFile');
  }

  async getSectionsFile() {
    return this._resolveDataFile(this.sectionsFile, this.sectionsFileFallback, 'getSectionsFile');
  }

  async getArchiveFile() {
    return this._resolveDataFile(this.archiveFile, this.archiveFileFallback, 'getArchiveFile');
  }

  isPkgMode() {
    return this.isPkg;
  }

  getAppUrl() {
    return `http://localhost:${this.config.port}`;
  }

  getApiUrl() {
    return `http://localhost:${this.config.port}/api`;
  }

  async checkIndexHtml() {
    try {
      let indexHtmlPath = path.join(this.buildDir, this.config.indexHtmlPath);
      let exists = await fs.pathExists(indexHtmlPath);

      if (!exists && this.isPkg) {
        const baseDirIndex = path.join(this.baseDir, this.config.indexHtmlPath);
        if (await fs.pathExists(baseDirIndex)) {
          this.buildDir = this.baseDir;
          indexHtmlPath = baseDirIndex;
          exists = true;
          console.log(`✅ ${this.config.indexHtmlPath} найден в папке exe: ${indexHtmlPath}`);
        }
      }

      this.indexHtmlExists = exists;

      if (!exists) {
        console.warn(`\n⚠️  Файл ${this.config.indexHtmlPath} не найден в ${this.buildDir}`);
        console.log('   Сервер запустится; в браузере откроется страница с инструкцией.');
        console.log('   Чтобы приложение работало: выполните "npm run build", затем скопируйте');
        console.log('   из папки build index.html, папки assets и data в папку с launch.exe.\n');
      } else {
        console.log(`✅ ${this.config.indexHtmlPath} найден: ${indexHtmlPath}`);
      }
      return exists;
    } catch (error) {
      console.error('❌ Ошибка при проверке index.html:', error);
      this.indexHtmlExists = false;
      return false;
    }
  }

  async openBrowser() {
    if (!this.config.openBrowser) return;

    if (os.platform() !== 'win32') {
      console.log('⚠️  Автооткрытие браузера только на Windows');
      console.log(`🌐 Откройте вручную: ${this.getAppUrl()}`);
      return;
    }

    const url = this.getAppUrl();
    if (!this.config.kioskMode) {
      console.log('💡 Kiosk выключен — DevTools доступны (F12)');
    }
    if (this.config.disableWebSecurity) {
      console.log('⚠️  CORS отключен в браузере (только для разработки).');
    }

    const chromePath = process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe';
    const edgePath = process.env['ProgramFiles(x86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe';
    const chromeExists = await fs.pathExists(chromePath);

    if (chromeExists) {
      let chromeFlags = '';
      if (this.config.disableWebSecurity) {
        chromeFlags += `--disable-web-security --user-data-dir="${os.tmpdir()}\\ChromeTempProfile" `;
      }
      if (this.config.kioskMode) {
        chromeFlags += `--autoplay-policy=no-user-gesture-required --app="${url}" --start-fullscreen --kiosk --disable-features=Translate,ContextMenuSearchWebFor,ImageSearch`;
      } else {
        chromeFlags += `--app="${url}" --auto-open-devtools-for-tabs`;
      }
      exec(`"${chromePath}" ${chromeFlags}`, (error) => {
        if (error) console.error('❌ Ошибка открытия Chrome:', error);
      });
      if (this.config.kioskMode) {
        setTimeout(() => {
          exec('taskkill /f /im explorer.exe', (error) => {
            if (error && !error.message.includes('не найден')) console.error('⚠️  explorer.exe:', error.message);
          });
        }, 12000);
      }
    } else {
      const edgeExists = await fs.pathExists(edgePath);
      if (edgeExists) {
        if (this.config.kioskMode) {
          exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "TranslateEnabled" /t REG_DWORD /d 0 /f >nul 2>&1', () => {});
          exec('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "ContextMenuSearchEnabled" /t REG_DWORD /d 0 /f >nul 2>&1', () => {});
        }
        let edgeFlags = '';
        if (this.config.disableWebSecurity) {
          edgeFlags += `--disable-web-security --user-data-dir="${os.tmpdir()}\\EdgeTempProfile" `;
        }
        if (this.config.kioskMode) {
          edgeFlags += `--kiosk "${url}" --edge-kiosk-type=fullscreen --no-first-run --disable-features=msEdgeSidebarV2,msHub,msWelcomePage`;
        } else {
          edgeFlags += `"${url}"`;
        }
        exec(`"${edgePath}" ${edgeFlags}`, (error) => {
          if (error) console.error('❌ Ошибка открытия Edge:', error);
        });
      } else {
        console.error('❌ Chrome и Edge не найдены. Откройте вручную:', url);
      }
    }
  }

  async initializeDataDir() {
    try {
      const gameItemsFile = await this.getGameItemsFile();
      const statisticsFile = await this.getStatisticsFile();

      if (!gameItemsFile || !statisticsFile) {
        throw new Error('Пути к файлам данных не определены.');
      }

      await fs.ensureDir(path.dirname(gameItemsFile));
      await fs.ensureDir(path.dirname(statisticsFile));

      const gameItemsExists = await fs.pathExists(gameItemsFile);
      const statisticsExists = await fs.pathExists(statisticsFile);

      console.log(`📂 currentExhibition.json: ${gameItemsExists ? '✅' : '❌'} ${gameItemsFile}`);
      console.log(`📂 progressPoints.json: ${statisticsExists ? '✅' : '❌'} ${statisticsFile}`);

      if (this.sectionsFileFallback || this.sectionsFile) {
        const sectionsPath = await this.getSectionsFile().catch(() => null);
        if (sectionsPath) {
          const sectionsExists = await fs.pathExists(sectionsPath);
          console.log(`📂 mainMenu.json: ${sectionsExists ? '✅' : '❌'} ${sectionsPath}`);
        }
      }
      if (this.archiveFileFallback || this.archiveFile) {
        const archivePath = await this.getArchiveFile().catch(() => null);
        if (archivePath) {
          const archiveExists = await fs.pathExists(archivePath);
          console.log(`📂 archive.json: ${archiveExists ? '✅' : '❌'} ${archivePath}`);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Ошибка инициализации данных:', error);
      return false;
    }
  }

  logServerInfo() {
    console.log(`🚀 Зал временных выставок — сервер на порту ${this.config.port}`);
    console.log(`📁 currentExhibition.json: ${this.gameItemsFile}`);
    console.log(`📁 progressPoints.json: ${this.statisticsFile}`);
    console.log(`📂 Статика: ${this.buildDir}`);
    console.log(`📂 Корень: ${this.baseDir}`);
    console.log(`🌐 Приложение: ${this.getAppUrl()}`);
    console.log(`🔧 Kiosk: ${this.config.kioskMode ? '✅' : '❌'}`);
    console.log(`🔒 CORS отключен в браузере: ${this.config.disableWebSecurity ? '✅ (небезопасно)' : '❌'}`);
    if (this.config.openBrowser) console.log(`🌐 Автооткрытие браузера: ✅`);
  }

  setupStaticFiles(app, express) {
    app.use(express.static(this.buildDir));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      const indexPath = path.join(this.buildDir, this.config.indexHtmlPath);
      if (this.indexHtmlExists) {
        res.sendFile(indexPath);
      } else {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(this._getIndexHtmlHelpPage());
      }
    });
  }

  _getIndexHtmlHelpPage() {
    const buildDir = this.buildDir.replace(/\\/g, '\\\\');
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Запуск приложения</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
    h1 { font-size: 1.25rem; color: #c00; }
    code { background: #f0f0f0; padding: 0.2em 0.4em; border-radius: 4px; }
    ol { margin: 1rem 0; padding-left: 1.5rem; }
    .path { word-break: break-all; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>index.html не найден</h1>
  <p>Сервер запущен, но в папке со сборкой нет <code>index.html</code>.</p>
  <p><strong>Что сделать:</strong></p>
  <ol>
    <li>В корне проекта выполните: <code>npm run build</code></li>
    <li>Скопируйте из папки <code>build</code> файл <code>index.html</code> и папку <code>assets</code> в ту же папку, где лежит <code>launch.exe</code>.</li>
    <li>Обновите эту страницу (F5).</li>
  </ol>
  <p>Либо выполните полную сборку из корня проекта: <code>npm run build:win</code>, затем запускайте <code>launch.exe</code> из папки <code>build\\</code> (в ней должны быть index.html, assets и data).</p>
  <p class="path">Папка, в которой ищется index.html: ${this.buildDir}</p>
</body>
</html>`;
  }

  async startServer(app, onReady) {
    try {
      await this.checkIndexHtml();

      app.listen(this.config.port, async () => {
        try {
          this.logServerInfo();
          if (onReady) await onReady();
          if (this.config.openBrowser) {
            setTimeout(async () => {
              try {
                await this.openBrowser();
              } catch (error) {
                console.error('❌ Ошибка открытия браузера:', error);
                console.log(`🌐 Откройте вручную: ${this.getAppUrl()}`);
              }
            }, this.config.browserDelay);
          }
        } catch (error) {
          console.error('❌ Ошибка после запуска:', error);
          throw error;
        }
      }).on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.error(`\n❌ Порт ${this.config.port} занят. Закройте другое приложение или смените порт.`);
        } else {
          console.error('\n❌ Ошибка запуска:', error.message);
        }
        console.log('\n⚠️  Окно закроется через 30 секунд...');
        setTimeout(() => process.exit(1), 30000);
      });
    } catch (error) {
      console.error('❌ Ошибка в startServer:', error);
      throw error;
    }
  }
}

module.exports = ServerSetup;
