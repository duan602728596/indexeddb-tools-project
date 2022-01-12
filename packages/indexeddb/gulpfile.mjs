import gulp from 'gulp';
import typescript from 'gulp-typescript';
import { rollup } from 'rollup';
import { terser } from 'rollup-plugin-terser';
import merge2 from 'merge2';
import tsconfig from '../../tsconfig.json';

/* 编译文件 */
function proLibProject() {
  const result = gulp.src('src/**/*.ts')
    .pipe(typescript(tsconfig.compilerOptions));

  return merge2([
    result.js.pipe(gulp.dest('lib')),
    result.dts.pipe(gulp.dest('lib'))
  ]);
}

/* dist */
function createProBuildProject(compression) {
  return async function proBuildProject() {
    const bundle = await rollup({
      input: 'lib/index.js',
      plugins: compression ? [terser()] : undefined
    });

    await bundle.write({
      exports: 'named',
      format: 'umd',
      name: 'IndexedDB',
      file: `dist/IndexedDB${ compression ? '.min' : '' }.js`
    });
  };
}

export default gulp.series(
  proLibProject,
  gulp.parallel(createProBuildProject(true), createProBuildProject(false))
);