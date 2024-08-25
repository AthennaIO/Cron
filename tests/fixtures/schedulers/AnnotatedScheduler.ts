/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Context } from '#src/types'
import { Scheduler } from '#src/annotations/Scheduler'

@Scheduler({ pattern: '* * * * *', alias: 'decoratedScheduler', camelAlias: 'annotatedScheduler', type: 'singleton' })
export class AnnotatedScheduler {
  public async handle(ctx: Context) {
    console.log(ctx)
  }
}
