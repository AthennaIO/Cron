/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Facade } from '@athenna/ioc'
import type { CronImpl } from '#src/cron/CronImpl'

export const Cron = Facade.createFor<CronImpl>('Athenna/Core/Cron')
