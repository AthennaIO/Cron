/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Cron } from '#src/facades/Cron'
import { Exec, Path } from '@athenna/common'
import { CronBuilder } from '#src/cron/CronBuilder'
import { CronKernel } from '#src/kernels/CronKernel'
import { CronProvider } from '#src/providers/CronProvider'
import { CronExceptionHandler } from '#src/handlers/CronExceptionHandler'
import { Test, BeforeEach, AfterEach, type Context, Mock } from '@athenna/test'
import { CustomCronExceptionHandler } from '#tests/fixtures/handlers/CustomCronExceptionHandler'

export class CronKernelTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    await Config.loadAll(Path.fixtures('config'))
    new CronProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()

    Cron.close()
  }

  @Test()
  public async shouldBeAbleToRegisterDefaultCronExceptionHandlerUsingKernel({ assert }: Context) {
    const kernel = new CronKernel()

    await kernel.registerExceptionHandler()

    assert.instanceOf(CronBuilder.exceptionHandler, CronExceptionHandler)
  }

  @Test()
  public async shouldBeAbleToRegisterCustomCronExceptionHandlerByImportAliases({ assert }: Context) {
    const kernel = new CronKernel()

    await kernel.registerExceptionHandler('#tests/fixtures/handlers/CustomCronExceptionHandler')

    assert.instanceOf(CronBuilder.exceptionHandler, CustomCronExceptionHandler)
  }

  @Test()
  public async shouldBeAbleToRegisterCustomCronExceptionHandlerByFullPath({ assert }: Context) {
    const kernel = new CronKernel()

    await kernel.registerExceptionHandler(Path.fixtures('handlers/CustomCronExceptionHandler.js'))

    assert.instanceOf(CronBuilder.exceptionHandler, CustomCronExceptionHandler)
  }

  @Test()
  public async shouldBeAbleToRegisterCustomCronExceptionHandlerByPartialPath({ assert }: Context) {
    const kernel = new CronKernel()

    await kernel.registerExceptionHandler('./tests/fixtures/handlers/CustomCronExceptionHandler.js')

    assert.instanceOf(CronBuilder.exceptionHandler, CustomCronExceptionHandler)
  }

  @Test()
  public async shouldBeAbleToRegisterRTracerPluginInCronHandler({ assert }: Context) {
    const kernel = new CronKernel()

    await kernel.registerRTracer()

    assert.isDefined(CronBuilder.rTracerPlugin)
  }

  @Test()
  public async shouldBeAbleToGetTraceIdInHandlerWhenRTracerPluginIsEnabled({ assert }: Context) {
    const kernel = new CronKernel()

    await kernel.registerRTracer()

    let traceId = null

    Cron.schedule()
      .name('r_tracer')
      .pattern('* * * * *')
      .runOnInit(true)
      .handler(ctx => {
        traceId = ctx.traceId
      })

    await Exec.sleep(100)

    assert.isDefined(traceId)
  }

  @Test()
  public async shouldBeAbleToRegisterSchedulersOfTheRcFileWithAndWithoutAnnotations({ assert }: Context) {
    const kernel = new CronKernel()
    await kernel.registerSchedulers()

    assert.isFalse(ioc.has('helloScheduler'))
    assert.isTrue(ioc.has('App/Cron/Schedulers/HelloScheduler'))
    assert.equal(ioc.getRegistration('App/Cron/Schedulers/HelloScheduler').lifetime, 'TRANSIENT')

    assert.isTrue(ioc.has('decoratedScheduler'))
    assert.isFalse(ioc.has('App/Cron/Schedulers/AnnotatedScheduler'))
    assert.equal(ioc.getRegistration('decoratedScheduler').lifetime, 'SINGLETON')
  }

  @Test()
  public async shouldBeAbleToRegisterCronRouteFile({ assert }: Context) {
    const kernel = new CronKernel()

    await kernel.registerRoutes('#tests/fixtures/routes/cron')

    const crons = Cron.getTasks()

    assert.isTrue(crons.has('route_scheduler'))
  }
}
