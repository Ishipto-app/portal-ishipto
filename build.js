import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const isGitHub = !!process.env.GITHUB_ACTIONS;
const hasConfigArg = args.some(arg => arg.includes('configuration'));
const isAngularTarget = process.env.BUILD_TARGET === 'angular' || isGitHub || hasConfigArg;

if (isAngularTarget) {
  console.log('[Build] Môi trường GitHub Actions / Angular được kích hoạt -> Tiến hành build Angular...');
  const buildCommand = args.length > 0 
    ? `npx ng build ${args.join(' ')}` 
    : 'npx ng build --configuration=production';
    
  try {
    execSync(buildCommand, { stdio: 'inherit' });
    
    // Đồng bộ build output: Sao chép file từ dist/fcl-customer-portal/browser (nếu có) ra dist/
    // để bất kể firebase.json cấu hình "public": "dist" hay "dist/fcl-customer-portal/browser" đều nhận diện đúng
    const ngOutBrowser = path.resolve('dist/fcl-customer-portal/browser');
    const ngOutRoot = path.resolve('dist/fcl-customer-portal');
    const targetDir = path.resolve('dist');

    const sourceDir = fs.existsSync(ngOutBrowser) 
      ? ngOutBrowser 
      : (fs.existsSync(ngOutRoot) ? ngOutRoot : null);

    if (sourceDir && sourceDir !== targetDir) {
      const files = fs.readdirSync(sourceDir);
      for (const file of files) {
        fs.cpSync(path.join(sourceDir, file), path.join(targetDir, file), { recursive: true });
      }
      console.log('[Build] Đã đồng bộ build output Angular ra thư mục dist/ phục vụ Firebase Hosting.');
    }
  } catch (err) {
    console.error('[Build] Lỗi khi biên dịch Angular, chuyển fallback sang Vite build:', err.message);
    const filteredArgs = args.filter(a => !a.includes('configuration')).join(' ');
    execSync(`npx vite build ${filteredArgs}`.trim(), { stdio: 'inherit' });
  }
} else {
  // Môi trường dev container thông thường
  execSync('npx vite build', { stdio: 'inherit' });
}
