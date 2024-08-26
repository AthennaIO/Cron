/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Cron } from '@athenna/cron'

export class TestScheduler {
  /**
   * Run a specific scheduler by its name.
   *
   * @example
   * ```js
   * await scheduler.runByName('MySchedulerClassName')
   * ```
   */
  public async runByName(name: string): Promise<void> {
    await Cron.runByName(name)
  }
}
