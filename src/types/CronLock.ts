/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type CronLockContext = {
  /**
   * The name of the scheduler.
   */
  name: string

  /**
   * The scheduled time this run is for. Every process running the same
   * scheduler gets the same one, so `name` + `matchedAt` names one run.
   */
  matchedAt: Date
}

/**
 * Decides whether this process runs a scheduled time of a scheduler, set
 * as `cron.lock` in the config. Resolve `true` to run it. Meant to be
 * backed by a store every process shares (a `SET NX` in Redis, a unique
 * row), so a scheduler runs once per scheduled time even while two copies
 * of the application are alive, as during a rolling deploy.
 */
export type CronLock = (ctx: CronLockContext) => boolean | Promise<boolean>
