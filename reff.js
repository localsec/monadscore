import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import fs from 'fs';
import axios from 'axios';
import pkg from 'https-proxy-agent';
const { HttpsProxyAgent } = pkg;
import cfonts from 'cfonts';
import { ethers } from 'ethers';

function centerText(text, color = "blueBright") {
  const terminalWidth = process.stdout.columns || 80;
  const textLength = text.length;
  const padding = Math.max(0, Math.floor((terminalWidth - textLength) / 2));
  return " ".repeat(padding) + chalk[color](text);
}

cfonts.say('LocalSec', {
  font: 'block',
  align: 'center',
  colors: ['cyan', 'black'],
});
console.log(centerText("=== Telegram Channel 🚀 : LocalSec ===\n", "blueBright"));
console.log(chalk.yellow('============ Bot Tự Đăng Ký Tài Khoản ===========\n'));

function generateRandomHeaders() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 10; SM-G970F) AppleWebKit/537.36 Chrome/115.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0'
  ];
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return {
    'User-Agent': randomUserAgent,
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9'
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function countdown(ms) {
  const seconds = Math.floor(ms / 1000);
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(chalk.grey(`\rĐang chờ ${i} detik... `));
    await delay(1000);
  }
  process.stdout.write('\r' + ' '.repeat(50) + '\r');
}

async function main() {
  const { useProxy } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'useProxy',
      message: 'Bạn có muốn sử dụng proxy không??',
      default: false,
    }
  ]);

  let proxyList = [];
  let proxyMode = null;
  if (useProxy) {
    const proxyAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'proxyType',
        message: 'Chọn loại proxy:',
        choices: ['Rotating', 'Static'],
      }
    ]);
    proxyMode = proxyAnswer.proxyType;
    try {
      const proxyData = fs.readFileSync('proxy.txt', 'utf8');
      proxyList = proxyData.split('\n').map(line => line.trim()).filter(Boolean);
      console.log(chalk.blueBright(`Có ${proxyList.length} proxy.\n`));
    } catch (err) {
      console.log(chalk.yellow('Không tìm thấy tệp proxy.txt, không sử dụng proxy.\n'));
    }
  }

  let count;
  while (true) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'count',
        message: 'Nhập số lượng Ref mong muốn: ',
        validate: (value) => {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed) || parsed <= 0) {
            return 'Vui lòng nhập số hợp lệ lớn hơn 0!';
          }
          return true;
        }
      }
    ]);
    count = parseInt(answer.count, 10);
    if (count > 0) break;
  }

  const { ref } = await inquirer.prompt([
    {
      type: 'input',
      name: 'ref',
      message: 'Nhập mã giới thiệu: ',
    }
  ]);

  console.log(chalk.yellow('\n==================================='));
  console.log(chalk.yellowBright(`Đang ${count} tài khoản ..`));
  console.log(chalk.yellowBright('Note: Bình tĩnh anh bạn. 🗿'));
  console.log(chalk.yellowBright('Gợi ý: Nếu bạn muốn chơi lớn, hãy sử dụng proxy..'));
  console.log(chalk.yellow('=====================================\n'));

  const fileName = 'accounts.json';
  let accounts = [];
  if (fs.existsSync(fileName)) {
    try {
      accounts = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    } catch (err) {
      accounts = [];
    }
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    console.log(chalk.cyanBright(`\n================================ ACCOUNT ${i + 1}/${count} ================================`));

    let accountAxiosConfig = {
      timeout: 50000,
      headers: generateRandomHeaders(),
      proxy: false
    };

    if (useProxy && proxyList.length > 0) {
      let selectedProxy;
      if (proxyMode === 'Rotating') {
        selectedProxy = proxyList[0];
      } else {
        selectedProxy = proxyList.shift();
        if (!selectedProxy) {
          console.error(chalk.red("Không còn proxy nào cho chế độ tĩnh."));
          process.exit(1);
        }
      }
      console.log("Sử dụng proxy: ", selectedProxy);
      const agent = new HttpsProxyAgent(selectedProxy);
      accountAxiosConfig.httpAgent = agent;
      accountAxiosConfig.httpsAgent = agent;
    }

    let accountIP = '';
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json', accountAxiosConfig);
      accountIP = ipResponse.data.ip;
    } catch (error) {
      accountIP = "Không nhận được IP";
      console.error("Lỗi khi nhận IP:", error.message);
    }
    console.log(chalk.white(`IP đã sử dụng: ${accountIP}\n`));

    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    console.log(chalk.greenBright(`✔️  Ví Ethereum đã được tạo thành công: ${walletAddress}`));

    const payload = {
      wallet: walletAddress,
      invite: ref
    };

    const regSpinner = ora('Gửi dữ liệu đến API...').start();
    try {
      await axios.post('https://mscore.onrender.com/user', payload, accountAxiosConfig);
      regSpinner.succeed(chalk.greenBright('  Tài khoản đã đăng ký thành công'));
      successCount++;

      accounts.push({
        walletAddress: walletAddress,
        privateKey: wallet.privateKey
      });
      try {
        fs.writeFileSync(fileName, JSON.stringify(accounts, null, 2));
        console.log(chalk.greenBright('✔️  Dữ liệu tài khoản đã được lưu thành công vào accounts.json'));
      } catch (err) {
        console.error(chalk.red(`✖   Không lưu được dữ liệu vào ${fileName}: ${err.message}`));
      }
    } catch (error) {
      regSpinner.fail(chalk.red(`✖   Không thành công ${walletAddress} : ${error.message}`));
      failCount++;
    }
    console.log(chalk.yellow(`\nProgress: ${i + 1}/${count} tài khoản đã được đăng ký. (Thành công: ${successCount}, Thất bại: ${failCount})`));
    console.log(chalk.cyanBright('====================================================================\n'));

    if (i < count - 1) {
      const randomDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;
      await countdown(randomDelay);
    }
  }
  console.log(chalk.blueBright('\nĐăng ký hoàn tất.'));
}

main();
