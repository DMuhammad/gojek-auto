const chalk = require("chalk");
const inquirer = require("inquirer");

const questionList = [
  "- Auto Register with SMS-ACTIVATE API",
  "- Auto Register with manually input number (coming soon)",
  "- Check Voucher (coming soon)",
  "- Another Tools (coming soon)",
  "- Exit",
];

const menuQuestion = {
  type: "list",
  name: "choice",
  message: "> Select tools:",
  choices: questionList,
};

const question = async () => {
  try {
    const { choice } = await inquirer.prompt(menuQuestion);
    choice == questionList[0] && require("./src/register-with-api");
    choice == questionList[4] && process.exit();
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  console.log(
    chalk.green(`

     ██████╗  ██████╗      ██╗███████╗██╗  ██╗      █████╗ ██╗   ██╗████████╗ ██████╗ 
    ██╔════╝ ██╔═══██╗     ██║██╔════╝██║ ██╔╝     ██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗
    ██║  ███╗██║   ██║     ██║█████╗  █████╔╝█████╗███████║██║   ██║   ██║   ██║   ██║
    ██║   ██║██║   ██║██   ██║██╔══╝  ██╔═██╗╚════╝██╔══██║██║   ██║   ██║   ██║   ██║
    ╚██████╔╝╚██████╔╝╚█████╔╝███████╗██║  ██╗     ██║  ██║╚██████╔╝   ██║   ╚██████╔╝
     ╚═════╝  ╚═════╝  ╚════╝ ╚══════╝╚═╝  ╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ 
                                                                                      
    - https://instagram.com/dzikrimuhammad__
    - https://github.com/DMuhammad
  `)
  );
  question();
})();
