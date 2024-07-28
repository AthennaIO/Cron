/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ScheduledTask as NodeCronScheduledTask } from 'node-cron'

export type ScheduledTask = NodeCronScheduledTask & {
  options: {
    name?: string
    timezone?: string
    runOnInit?: boolean
    scheduled?: boolean
    recoverMissedExecutions?: boolean
  }
}
