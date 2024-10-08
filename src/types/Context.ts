/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface Context {
  name?: string
  traceId?: string
  pattern?: string
  timezone?: string
  runOnInit?: boolean
  recoverMissedExecutions?: boolean
}
