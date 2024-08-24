/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Scheduler } from '#src'

@Scheduler({ pattern: '* * * * *' })
export class ProductScheduler {
  public async handler() {
    return 'handler'
  }
}
