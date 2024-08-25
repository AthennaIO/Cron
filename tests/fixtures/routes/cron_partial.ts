/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Cron } from '#src'

Cron.schedule()
  .name('route_scheduler_partial')
  .pattern('* * * * *')
  .handler(() => {})
