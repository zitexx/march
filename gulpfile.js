const {
  src,
  dest,
  watch,
  parallel, //возможность запускать несколько функций
  series,
} = require('gulp')
const scss = require('gulp-sass')
const concat = require('gulp-concat') //объединяет и переименовывает файлы
const autoprefixer = require('gulp-autoprefixer') //добавление префиксов 
const uglify = require('gulp-uglify') // минификация js файлов
const browserSync = require('browser-sync').create() //обновление страницы браузера при изменении файлов
const imagemin = require('gulp-imagemin') //работа с изображениями
const del = require('del') //удаление папки dist перед записью

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    },
    localOnly: true,
    notify: false
  })
}


// Стили
function styles() {
  return src('app/scss/style.scss') // через запятую можно указывать пути к файлам которые будут соединяться в один с помощью плагина concat
    .pipe(scss({
      outputStyle: 'compressed'
    })) // стили файла css (читаемость, сжатие-минификация и т.д.)
    .pipe(concat('style.min.css')) // указания сохранения названия файла
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'], // использовать для последних 10 версий браузеров
      grid: true
    })) // настройка (опции) для autoprefixer  
    .pipe(dest('app/css')) // куда сохраняется файл css
    .pipe(browserSync.stream()) //
}

// Для файлов JS
function scripts() {
  return src(['node_modules/jquery/dist/jquery.js',
      'node_modules/slick-carousel/slick/slick.js',
      'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
      'node_modules/rateyo/src/jquery.rateyo.js',
      'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
      'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

//для изображения
function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}

//перенесение файлов в готовый проект
function build() {
  return src([
      'app/**/*html',
      'app/css/style.min.css',
      'app/js/main.min.js'
    ], {
      base: 'app'
    })
    .pipe(dest('dist'))
}

//очистка папки dist перед записью
function clearDist() {
  return del('dist')
}

//функция слежения за изменением файла
function watching() {
  watch(['app/scss/**/*.scss'], styles)
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts)
  watch(['app/**/*.html']).on('change', browserSync.reload)

}

// возможность, запуск функций для запуска через терминал 
exports.styles = styles
exports.scripts = scripts
exports.browsersync = browsersync
exports.watching = watching
exports.images = images
exports.clearDist = clearDist
exports.build = series(clearDist, images, build)

exports.default = parallel(styles, scripts, browsersync, watching)