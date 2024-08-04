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
  public async shouldBeAbleToScheduleATask({ assert }: Context) {
    let hasRun = false

    Cron.schedule()
      .pattern('59 * * * *')
      .runOnInit(true)
      .handler(() => (hasRun = true))

    assert.isTrue(hasRun)
  }

  @Test()
  public async shouldBeAbleToValidateThatACronIsValidOrInvalid({ assert }: Context) {
    assert.isTrue(Cron.validate('59 * * * *'))
    assert.isFalse(Cron.validate('60 * * * *'))
  }

  @Test()
  public async shouldBeAbleToListAllScheduledTasks({ assert }: Context) {
    const tasks = Cron.getTasks()

    assert.deepEqual(tasks.size, 1)
  }

  @Test()
  public async shouldBeAbleToStopAllScheduledTasks({ assert }: Context) {
    let hasRun = false

    Cron.schedule()
      .pattern('59 * * * *')
      .handler(() => (hasRun = true))

    Cron.close()

    assert.isFalse(hasRun)
  }

  @Test()
  public async shouldBeAbleToScheduleATaskWithName({ assert }: Context) {
    Cron.schedule()
      .name('myTask')
      .pattern('59 * * * *')
      .handler(() => {})

    const tasks = Cron.getTasks()

    assert.isDefined(tasks.get('myTask'))
  }

  @Test()
  public async shouldBeAbleToScheduleATaskWithDisabledScheduler({ assert }: Context) {
    Cron.schedule()
      .name('disabledTask')
      .pattern('59 * * * *')
      .scheduled(false)
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('disabledTask')

    assert.isFalse(task.options.scheduled)
  }

  @Test()
  public async shouldBeAbleToScheduleATaskToRunInDifferentTimezone({ assert }: Context) {
    Cron.schedule()
      .name('timezoneTask')
      .pattern('59 * * * *')
      .timezone('America/Sao_Paulo')
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('timezoneTask')

    assert.deepEqual(task.options.timezone, 'America/Sao_Paulo')
  }

  @Test()
  public async shouldBeAbleToScheduleATaskWithRecoverMissedExecutions({ assert }: Context) {
    Cron.schedule()
      .name('recoverMissedExecutionsTask')
      .pattern('59 * * * *')
      .recoverMissedExecutions(true)
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('recoverMissedExecutionsTask')

    assert.isTrue(task.options.recoverMissedExecutions)
  }

  @Test()
  public async shouldBeAbleToOverwriteSchedulersIfUsingSameName({ assert }: Context) {
    Cron.schedule()
      .name('overwriteScheduler')
      .scheduled(false)
      .pattern('59 * * * *')
      .handler(() => {})

    Cron.schedule()
      .name('overwriteScheduler')
      .scheduled(true)
      .pattern('59 * * * *')
      .handler(() => {})

    const tasks = Cron.getTasks()
    const task = tasks.get('overwriteScheduler')

    assert.isTrue(task.options.scheduled)
  }
}
