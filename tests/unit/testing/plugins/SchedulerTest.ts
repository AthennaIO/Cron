/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Cron } from '#src/facades/Cron'
import { CronProvider } from '#src/providers/CronProvider'
import { Test, BeforeEach, AfterEach, type Context } from '@athenna/test'

export class CronImplTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    new CronProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await new CronProvider().shutdown()
  }

  @Test()
  public async shouldBeAbleToManuallyRunATaskByNameUsingSchedulerPlugin({ scheduler, assert }: Context) {
    let hasRun = false

    Cron.schedule()
      .name('manual_run')
      .pattern('59 * * * *')
      .handler(() => (hasRun = true))

    await scheduler.runByName('manual_run')

    assert.isTrue(hasRun)
  }
}
