const axios = require("axios");
const chalk = require("chalk");
const ora = require("ora");
const Table = require("cli-table3");

const BUNDLEPHOBIA_API = "https://bundlephobia.com/api/size";

function buildBundlephobiaUrl(packageName) {
  return `${BUNDLEPHOBIA_API}?package=${encodeURIComponent(packageName)}`;
}

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + "B";
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + " kB";
  const mb = kb / 1024;
  return mb.toFixed(1) + " MB";
};

const formatTime = (size) => {
  // Rough estimation of download times
  const slow3G = ((size / 1024) * 8) / 50; // 50 kbps
  const emerging4G = ((size / 1024) * 8) / 1000; // 1000 kbps
  return {
    slow3G: Math.ceil(slow3G) + "ms",
    emerging4G: Math.ceil(emerging4G) + "ms",
  };
};

/**
 * Fetches package size information from Bundlephobia
 * @param {string} packageName - Name of the package to check
 * @returns {Promise<Object>} Package size information
 */
async function getPackageSize(packageName) {
  const spinner = ora({
    text: chalk.blue(`Fetching size for ${chalk.bold(packageName)}...`),
    spinner: {
      frames: [
        "===========🌿🦛",
        "=========🌿🦛",
        "========🌿🦛",
        "=======🌿🦛",
        "======🌿🦛",
        "=====🌿🦛",
        "====🌿🦛",
        "===🌿🦛",
        "==🌿🦛",
        "=🌿🦛",
        "=🌿🦛",
        "🌿🦛",
        "=🌿🦛",
        "=🌿🦛",
        "==🌿🦛",
        "===🌿🦛",
        "====🌿🦛",
        "=====🌿🦛",
        "======🌿🦛",
        "=======🌿🦛",
        "========🌿🦛",
        "=========🌿🦛",
      ],
      interval: 80, // controls the speed of animation
    },
  }).start();

  try {
    const response = await axios.get(
      `${BUNDLEPHOBIA_API}?package=${packageName}`
    );
    spinner.succeed(chalk.green(`${packageName.toUpperCase()} Size ->`));

    const times = formatTime(response.data.size);
    console.log(chalk.red.bold("\nDownload Time 💨"));
    console.log(`${times.slow3G}\t\t${times.emerging4G}`);
    console.log(`${chalk.dim("Slow 3G")}\t\t${chalk.dim("Emerging 4G")}`);

    console.log(chalk.red.bold("\nBundle Size 📦"));
    console.log(
      `${formatBytes(response.data.size)}\t\t${formatBytes(response.data.gzip)}`
    );
    console.log(`${chalk.dim("Minified")}\t${chalk.dim("Minified + Gzipped")}`);

    // Add Hippo Score section
    const { score, rating } = calculatePackageScore(response.data);
    console.log(chalk.red.bold("\nHippo Score 🎖️"));
    console.log(`${score}/10\t\t${rating}`);
    console.log(`${chalk.dim("Score")}\t${chalk.dim("Rating")}`);

    return;
  } catch (error) {
    spinner.fail(chalk.red(`🤔 Are you sure ${packageName} exists?`));

    if (error.response?.status === 404) {
      console.log(
        "\n" +
          chalk.yellow(
            "┌──────────────────────────────────────────────────────┐"
          )
      );
      console.log(
        chalk.yellow("│") +
          chalk.red.bold(` 🦛 Hippoo couldn't find package: ${packageName} `) +
          chalk.yellow("│")
      );
      console.log(
        chalk.yellow("└──────────────────────────────────────────────────────┘")
      );
      console.log("\n" + chalk.greenBright("Suggestions:"));
      console.log(
        chalk.dim(
          chalk.greenBright("->") + " Check for typos in the package name"
        )
      );
      console.log(
        chalk.dim(
          chalk.greenBright("->") + " Make sure the package is published to npm"
        )
      );
      console.log(
        chalk.dim(chalk.greenBright("->") + " Try searching on npmjs.com")
      );
      process.exit(1);
    } else {
      console.log(
        "\n" + chalk.yellow("┌────────────────────────────────────────┐")
      );
      console.log(
        chalk.yellow("│") +
          chalk.red.bold(` 🦛 Something Went Wrong `) +
          chalk.yellow("│")
      );
      console.log(chalk.yellow("└────────────────────────────────────────┘"));
      console.log("\n" + chalk.white("Failed to fetch package information:"));
      console.log(chalk.red(error.message));
      process.exit(1);
    }
  }
}

const calculatePackageScore = (packageData) => {
  let score = 0;

  // 1. Size Score (0-3 points)
  // Less than 5KB: 3 points
  // 5KB-50KB: 2 points
  // 50KB-500KB: 1 point
  // >500KB: 0 points
  const sizeKB = packageData.gzip / 1024;
  if (sizeKB < 5) score += 3;
  else if (sizeKB < 50) score += 2;
  else if (sizeKB < 500) score += 1;

  // 2. Download Time Score (0-2 points)
  // <5ms: 2 points
  // 5-20ms: 1 point
  // >20ms: 0 points
  const downloadTime = ((packageData.size / 1024) * 8) / 1000; // emerging 4G time
  if (downloadTime < 5) score += 2;
  else if (downloadTime < 20) score += 1;

  // 3. Dependencies Score (0-3 points)
  // 0 deps: 3 points
  // 1-5 deps: 2 points
  // 6-15 deps: 1 point
  // >15 deps: 0 points
  if (packageData.dependencyCount === 0) score += 3;
  else if (packageData.dependencyCount <= 5) score += 2;
  else if (packageData.dependencyCount <= 15) score += 1;

  // 4. ES Module Support (0-2 points)
  // Has both ESM and tree-shaking: 2 points
  // Has either ESM or tree-shaking: 1 point
  // Neither: 0 points
  if (packageData.hasJSModule && !packageData.hasSideEffects) score += 2;
  else if (packageData.hasJSModule || !packageData.hasSideEffects) score += 1;

  return {
    score,
    rating:
      score >= 8
        ? "Excellent 🎉"
        : score >= 6
        ? "Good 👍"
        : score >= 4
        ? "Fair 🤔"
        : "Poor 😕",
  };
};

const comparePackages = async (packageNames) => {
  const spinner = ora({
    text: chalk.blue(`Comparing packages: ${packageNames.join(", ")}...`),
    spinner: {
      frames: [
        "===========🌿🦛",
        "=========🌿🦛",
        "========🌿🦛",
        "=======🌿🦛",
        "======🌿🦛",
        "=====🌿🦛",
        "====🌿🦛",
        "===🌿🦛",
        "==🌿🦛",
        "=🌿🦛",
        "=🌿🦛",
        "🌿🦛",
        "=🌿🦛",
        "=🌿🦛",
        "==🌿🦛",
        "===🌿🦛",
        "====🌿🦛",
        "=====🌿🦛",
        "======🌿��",
        "=======🌿🦛",
        "========🌿🦛",
        "=========🌿🦛",
      ],
      interval: 80,
    },
  }).start();

  try {
    // Fetch all package data in parallel
    const results = await Promise.all(
      packageNames.map(async (pkg) => {
        const response = await axios.get(`${BUNDLEPHOBIA_API}?package=${pkg}`);
        const scoreData = calculatePackageScore(response.data);
        return {
          name: pkg,
          ...response.data,
          score: scoreData.score,
          rating: scoreData.rating,
        };
      })
    );

    spinner.succeed(chalk.green("Comparison complete!"));

    // Generate the comparison table
    const table = generateComparisonTable(results);
    console.log(table);

    // Generate and display the summary
    const summary = generateComparison(results);
    console.log(summary);

    return results;
  } catch (error) {
    spinner.fail(chalk.red("Failed to compare packages"));
    handleComparisonError(error, packageNames);
  }
};

function capitalizePackageName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateComparisonTable(packages) {
  const table = new Table({
    head: [
      chalk.cyan("Metric 📊"),
      ...packages.map((p) => chalk.cyan(capitalizePackageName(p.name))),
    ],
    chars: {
      top: "─",
      "top-mid": "┬",
      "top-left": "┌",
      "top-right": "┐",
      bottom: "─",
      "bottom-mid": "┴",
      "bottom-left": "└",
      "bottom-right": "┘",
      left: "│",
      "left-mid": "├",
      mid: "─",
      "mid-mid": "┼",
      right: "│",
      "right-mid": "┤",
      middle: "│",
    },
  });

  table.push(
    ["Size", ...packages.map((p) => formatBytes(p.size))],
    ["Gzipped", ...packages.map((p) => formatBytes(p.gzip))],
    ["Download", ...packages.map((p) => formatTime(p.size).emerging4G)],
    ["Dependencies", ...packages.map((p) => p.dependencyCount.toString())],
    ["Tree-Shake", ...packages.map((p) => (p.hasJSModule ? "Yes" : "No"))],
    ["Score", ...packages.map((p) => `${p.score}/10 ${p.rating.split(" ")[1]}`)]
  );

  return table.toString();
}

function generateComparison(packages) {
  const sorted = {
    bySize: [...packages].sort((a, b) => b.gzip - a.gzip),
    byScore: [...packages].sort((a, b) => b.score - a.score),
    bySpeed: [...packages].sort((a, b) => a.size - b.size),
  };

  const sizeInsight = `${capitalizePackageName(
    sorted.bySize[0].name
  )} (${formatBytes(sorted.bySize[0].gzip)}) is ${(
    sorted.bySize[0].gzip / sorted.bySize[sorted.bySize.length - 1].gzip
  ).toFixed(1)}x larger than ${capitalizePackageName(
    sorted.bySize[sorted.bySize.length - 1].name
  )} (${formatBytes(sorted.bySize[sorted.bySize.length - 1].gzip)})`;

  return `
${chalk.cyan.bold("📊 Comparison Summary:")}

${chalk.yellow("Size Impact:")}
${sizeInsight}

${chalk.yellow("🎯 Best Choice For:")}
• Performance-Critical Apps: ${chalk.green(
    capitalizePackageName(sorted.bySpeed[0].name)
  )}
• Balanced Development: ${chalk.green(
    capitalizePackageName(sorted.byScore[1].name)
  )}
• Feature-Rich Projects: ${chalk.green(
    capitalizePackageName(sorted.byScore[0].name)
  )}
`;
}

function handleComparisonError(error, packageNames) {
  if (error.response?.status === 404) {
    // Find which package caused the 404
    const failedPackage = packageNames.find((pkg) =>
      error.message.includes(pkg)
    );

    console.log(
      "\n" +
        chalk.yellow("┌──────────────────────────────────────────────────────┐")
    );
    console.log(
      chalk.yellow("│") +
        chalk.red.bold(
          ` 🦛 Hippoo couldn't find package: ${failedPackage || "unknown"} `
        ) +
        chalk.yellow("│")
    );
    console.log(
      chalk.yellow("└──────────────────────────────────────────────────────┘")
    );
    console.log("\n" + chalk.greenBright("Suggestions:"));
    console.log(
      chalk.dim(
        chalk.greenBright("->") + " Check for typos in the package names"
      )
    );
    console.log(
      chalk.dim(
        chalk.greenBright("->") + " Make sure all packages are published to npm"
      )
    );
  } else {
    console.log(
      "\n" + chalk.yellow("┌────────────────────────────────────────┐")
    );
    console.log(
      chalk.yellow("│") +
        chalk.red.bold(` 🦛 Something Went Wrong `) +
        chalk.yellow("│")
    );
    console.log(chalk.yellow("└────────────────────────────────────────┘"));
    console.log("\n" + chalk.white("Failed to fetch package information:"));
    console.log(chalk.red(error.message));
  }
  process.exit(1);
}

module.exports = {
  getPackageSize,
  calculatePackageScore,
  comparePackages,
};

//The funcs is an in-house one where we scale packages on a scale of 1-10
//So results will be like a combination of size and time to download.
//What is the best way to do this?

//1. Size
//2. Time to download
//3. Dependencies
//4. ES Modules
