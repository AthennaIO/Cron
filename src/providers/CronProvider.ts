/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CronImpl } from '#src/cron/CronImpl'
import { ServiceProvider } from '@athenna/ioc'

export class CronProvider extends ServiceProvider {
  public register() {
    this.container.instance('Athenna/Core/Cron', new CronImpl())
  }

  public async shutdown() {
    const Cron = this.container.use<CronImpl>('Athenna/Core/Cron')

    if (!Cron) {
      return
    }

    Cron.close()
  }
}
