import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { clearLine, cursorTo } from "readline";
import query, { DepartmentCode, CourseMeta } from "ntnu-course";
import { Pool } from "./pool";

const parallel = process.argv.includes("--parallel")
    ? parseInt(process.argv[process.argv.indexOf("--parallel") + 1])
    : process.argv.includes("-p")
    ? parseInt(process.argv[process.argv.indexOf("-p") + 1])
    : 3;

main();

async function main() {
    const departments = Object.keys(DepartmentCode).filter(
        (key) => key.match(/^[A-Z]/) && key.length < 5,
    ) as (keyof typeof DepartmentCode)[];

    if (!existsSync(resolve("./data/meta"))) {
        mkdirSync(resolve("./data/meta"), { recursive: true });
    }

    const counter = {
        parsed: 0,
        skipped: 0,
        failed: 0,
    };

    const StartTime = Date.now();

    const pool = new Pool(parallel);

    for (const department of departments) {
        const meta_path = resolve("./data/meta", `${department}.json`);

        let meta: CourseMeta[];
        if (!existsSync(meta_path)) {
            meta = await query.meta({ department });
            writeFileSync(meta_path, JSON.stringify(meta, null, 4));
        } else {
            meta = JSON.parse(readFileSync(meta_path, "utf8"));
        }

        if (!existsSync(resolve("./data/info/", department))) {
            mkdirSync(resolve("./data/info/", department), { recursive: true });
        }

        log_progress(
            `\x1b[93m[Preparing]\x1b[m \x1b[95m${second_to_time(Math.floor((Date.now() - StartTime) / 1000))}\x1b[m ` +
                `Getting metadata of \x1b[93m${department}\x1b[m`,
        );

        for (const course of meta) {
            pool.push(async () => {
                const course_path = resolve("./data/info", department, `${course.code}-${course.group || "X"}.json`);
                if (existsSync(course_path)) {
                    counter.skipped++;
                    return;
                }

                try {
                    const data = await query.info(course);
                    writeFileSync(course_path, JSON.stringify(data, null, 4));
                    counter.parsed++;
                } catch (e) {
                    console.error(e);
                    counter.failed++;
                }

                log_progress(
                    `\x1b[92m[Running]\x1b[m \x1b[95m${second_to_time(Math.floor((Date.now() - StartTime) / 1000))}\x1b[m ` +
                        `Parsed: \x1b[93m${counter.parsed}\x1b[m, Skipped: \x1b[93m${counter.skipped}\x1b[m, Failed: \x1b[93m${counter.failed}\x1b[m`,
                );
            });
        }
    }

    await pool.go();

    log_progress(
        `\x1b[96m[Finished]\x1b[m \x1b[95m${second_to_time(Math.floor((Date.now() - StartTime) / 1000))}\x1b[m ` +
            `Parsed: \x1b[93m${counter.parsed}\x1b[m, Skipped: \x1b[93m${counter.skipped}\x1b[m, Failed: \x1b[93m${counter.failed}\x1b[m\n`,
    );
}

function second_to_time(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const seconds_ = seconds % 60;

    return `${hours}h ${minutes}m ${seconds_}s`;
}

function log_progress(message: string): void {
    clearLine(process.stdout, 0);
    cursorTo(process.stdout, 0);
    process.stdout.write(message);
}
