#!/usr/bin/env node

// 1. Import dependencies
const { Command } = require("commander");
const chalk = require("chalk");
const { getPackageSize, comparePackages } = require("./utils/utils");
const { version } = require("./package.json");
const program = new Command();

program
  .name(chalk.cyan("hippoo"))
  .description(chalk.white("A CLI tool to check for hippoo-like packages."))
  .version(
    version,
    "-v, --version",
    chalk.green("🔖 Output the current version")
  );

program
  .argument("[package]", chalk.yellow("📦 Package name to check size"))
  .argument("[packages...]", chalk.yellow("📊 Additional packages to compare"))
  .option("-d, --dev", chalk.blue("🛠  Include devDependencies"))
  .option("-j, --json", chalk.magenta("🎯 Output in JSON format"))
  .action(async (packageName, additionalPackages) => {
    if (!packageName) {
      console.log(
        chalk.red(
          `👋 Hey there, seems you forgot to add a package name \n\n Here are some things you can try out 🚀 \n\n ${chalk.bgBlueBright(
            "-To check size of a package -> hippoo react"
          )} \n\n ${chalk.bgGreenBright(
            "-To compare packages -> hippoo compare react vue"
          )} \n\n`
        )
      );
      return;
    }

    if (additionalPackages && additionalPackages.length > 0) {
      console.log(
        chalk.yellow(
          "\n📦 To compare multiple packages, use the compare command:"
        )
      );
      console.log(
        chalk.green(
          `\n$ hippoo compare ${packageName} ${additionalPackages.join(" ")}\n`
        )
      );
      return;
    }

    await getPackageSize(packageName);
  });

program
  .command("compare")
  .argument("<packages...>", chalk.yellow("📊 Packages to compare"))
  .description(chalk.blue("🔄 Compare multiple packages"))
  .action(async (packages) => {
    await comparePackages(packages);
  });

program
  .command("size")
  .description(chalk.blue("📏 Calculate total size of installed packages"))
  .option("-d, --dev", chalk.yellow("🛠  Include devDependencies"))
  .action(() => {
    console.log(chalk.green("Calculating total installed package size..."));
  });

// Add help information
program.addHelpText(
  "beforeAll",
  `
${chalk.cyan.bold("🦛 Welcome to Hippoo CLI!")} 
${chalk.yellow("===============================")}

${chalk.white.bold("Usage:")}
  ${chalk.dim("$")} hippoo ${chalk.yellow(
    "<package>"
  )}              ${chalk.dim("# Check single package")}
  ${chalk.dim("$")} hippoo ${chalk.green("compare")} ${chalk.yellow(
    "<pkg1> <pkg2> ..."
  )}   ${chalk.dim("# Compare packages")}
`
);

program.addHelpText(
  "afterAll",
  `
${chalk.cyan.bold("Examples:")}
  ${chalk.green("$")} ${chalk.yellow(
    "hippoo react"
  )}                    ${chalk.blue("📦 Check single package size")}
  ${chalk.green("$")} ${chalk.yellow(
    "hippoo compare react vue preact"
  )}  ${chalk.blue("🔄 Compare multiple packages")}
  ${chalk.green("$")} ${chalk.yellow(
    "hippoo compare next nuxt gatsby"
  )}  ${chalk.blue("📊 Compare frameworks")}
  ${chalk.green("$")} ${chalk.yellow(
    "hippoo size --dev"
  )}              ${chalk.blue("📏 Check project size with devDependencies")}

${chalk.yellow.bold("Commands:")}
  ${chalk.green(
    "compare"
  )}  Compare two or more packages (e.g., hippoo compare react vue solid)
  ${chalk.green("size")}     Calculate total size of installed packages

${chalk.red("For more info, visit:")} ${chalk.red(
    "https://github.com/codiejay/hippoo"
  )}
`
);

// 6. Parse input
program.parse(process.argv);
