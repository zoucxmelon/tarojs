const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const asyncFs = require("./utils/fs.js");
const appConfig = require("../package.json");
const hashCode = require("./utils/hash.js");
let isReady = true;

const dirName = `module__${appConfig.version.split('.').join('_')}__${hashCode}`;
// 获取文件列表
function geFileList(path) {
  let filesList = [];
  let targetObj = {};
  readFile(path, filesList, targetObj);
  return filesList;
}

// 遍历读取文件
function readFile(path, filesList, targetObj) {
  files = fs.readdirSync(path); //需要用到同步读取
  for (let i = 0; i < files.length; i++) {
    if (!isReady) continue;
    walk(files[i]);
  }
  function walk(file) {
    let fileEntryPath = `pages/${dirName}/src/pages/${file}/index`;
    let pagesConfig = getPagesConfig(`src/pages/${file}/index.tsx`);
    if (!pagesConfig) {
      isReady = false;
      return false;
    }
    console.log(chalk.green("[√]检测通过"));
    let item = { name: pagesConfig.navigationBarTitleText, url: fileEntryPath, key: `${file}_${hashCode}`, componentName: `${dirName}_${file}` };
    filesList.push(item);
  }
}

//写入文件utf-8格式201728078
function writeFile(fileName, data) {
  asyncFs.createDirAndCoverOld(dirName).then(() => {
    asyncFs.outputFileAndCoverOld(fileName, data);
    console.log(chalk.green("\n模块配置文件生成成功，正在生成代码包...\n"));
    createCodePackage();
  });

}

// 判断文件是否符合规范
function getPagesConfig(filePath) {

  console.log(chalk.yellow(`[..]正在检测${filePath}文件`));
  // 判断是否包含文件
  if (!asyncFs.isExistPath(filePath)) {
    console.log(chalk.red(`未找到${filePath}文件！！！`));
    return false;
  }

  // 判断是否包含navigationBarTitleText配置
  let fileStr = asyncFs.getFileUTF8Content(filePath).replace(/\s+/g, "");
  if (fileStr.indexOf("navigationBarTitleText") === -1) {
    console.log(chalk.red(`${filePath}未找到navigationBarTitleText配置！！！`));
    return false;
  }
  // 匹配
  let reg = /{navigationBarTitleText:['|"]([^"|']+)['|"]/;
  return {
    navigationBarTitleText: fileStr.match(reg)[1]
  };
}

// 生成代码包
function createCodePackage() {
    asyncFs.createDirAndCoverOld(`${dirName}/src`).then(() => {
      asyncFs.copyFileOrDirCoverOld("src/pages", `${dirName}/src/pages`);
      asyncFs.copyFileOrDirCoverOld("static", `${dirName}/static`).then(() => {
        console.log(chalk.green(`
        *    代码包已生成
        *    文件夹名称：${dirName}
        *    请通过 ${chalk.yellow("https://appfactory.hanclouds.com/upload")} 创建或更新模块
        `));
      });
      asyncFs
        .copyFileOrDirCoverOld("src/config", `${dirName}/src/config`)
        .then(() => {
          console.log(chalk.green("[√]拷贝配置文件成功"));
          let package = asyncFs.getFileUTF8Content("package.json");
          asyncFs.outputFileAndCoverOld(`${dirName}/package.json`, package);
          console.log(chalk.green("[√]拷贝 package.json 成功"));

        });
    });
}

let filesList = geFileList("src/pages");
let str = JSON.stringify(filesList);
str = `{"moduleName":"${appConfig.name}","version":"${appConfig.version}","key":"${hashCode}","dir":"${dirName}","pages":${str}}`;
if (isReady) writeFile(`${dirName}/module.config.json`, str);
