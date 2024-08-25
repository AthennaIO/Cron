/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Cron } from '#src/facades/Cron'
import { CronKernel } from '#src/kernels/CronKernel'
import { Log, LoggerProvider } from '@athenna/logger'
import { Path, Exec, Exception } from '@athenna/common'
import { CronProvider } from '#src/providers/CronProvider'
import { Test, BeforeEach, AfterEach, type Context, Mock } from '@athenna/test'

export class CronExceptionHandlerTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    await Config.loadAll(Path.fixtures('config'))
    new CronProvider().register()
    new LoggerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()

    Cron.close().truncate()
  }

  @Test()
  public async shouldBeAbleToThrowCustomizedAthennaExceptionsInTheDefaultExceptionHandler({ assert }: Context) {
    const kernel = new CronKernel()
    await kernel.registerExceptionHandler()

    const spy = Log.spy()
    const exception = new Exception({ code: 'E_NOT_FOUND', message: 'hey', status: 404 })

    Cron.schedule()
      .name('e_handler')
      .pattern('* * * * *')
      .runOnInit(true)
      .handler(() => {
        throw exception
      })

    await Exec.sleep(100)

    assert.calledWith(spy.error, await exception.prettify())
  }

  @Test()
  public async shouldNotSetTheErrorNameErrorMessageAndErrorStackWhenDebugModeIsNotActivatedInDefaultExceptionHandler({
    assert
  }: Context) {
    Config.set('app.debug', false)
    const kernel = new CronKernel()
    await kernel.registerExceptionHandler()

    const spy = Log.spy()
    const error = new TypeError('hey')

    Cron.schedule()
      .name('e_handler')
      .pattern('* * * * *')
      .runOnInit(true)
      .handler(() => {
        throw error
      })

    await Exec.sleep(100)

    assert.calledOnce(spy.error)
  }

  @Test()
  public async shouldIgnoreTheExceptionFromBeingLoggedWhenTheCodeIsSetInsideIgnoreCodes({ assert }: Context) {
    Config.set('cron.logger.ignoreCodes', ['E_IGNORE_THIS'])
    const kernel = new CronKernel()
    await kernel.registerExceptionHandler()

    const spy = Log.spy()

    Cron.schedule()
      .name('e_handler')
      .pattern('* * * * *')
      .runOnInit(true)
      .handler(() => {
        throw new Exception({ code: 'E_IGNORE_THIS' })
      })

    assert.notCalled(spy.error)
  }

  @Test()
  public async shouldIgnoreTheExceptionFromBeingLoggedWhenTheStatusIsSetInsideIgnoreStatus({ assert }: Context) {
    Config.set('cron.logger.ignoreStatus', [404])
    const kernel = new CronKernel()
    await kernel.registerExceptionHandler()

    const spy = Log.spy()

    Cron.schedule()
      .name('e_handler')
      .pattern('* * * * *')
      .runOnInit(true)
      .handler(() => {
        throw new Exception({ status: 404 })
      })

    assert.notCalled(spy.error)
  }
}
