import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const hasConfigArg = args.some(arg => arg.includes('configuration'));

if (hasConfigArg) {
  // Khi GitHub Actions hoặc Firebase Hosting gọi với cờ --configuration=production
  try {
    console.log('[Build] Phát hiện tham số --configuration, chạy Angular build (ng build)...');
    execSync(`npx ng build ${args.join(' ')}`, { stdio: 'inherit' });
  } catch (err) {
    console.log('[Build] Chuyển tiếp sang Vite build (đã loại bỏ tham số không tương thích)...');
    const filteredArgs = args.filter(a => !a.includes('configuration')).join(' ');
    execSync(`npx vite build ${filteredArgs}`.trim(), { stdio: 'inherit' });
  }
} else {
  // Chế độ build thông thường
  execSync('npx vite build', { stdio: 'inherit' });
}
