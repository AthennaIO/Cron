import { debug } from '#src/debug'
import { Cron } from '#src/facades/Cron'
import { CronBuilder } from '#src/cron/CronBuilder'
import { sep, isAbsolute, resolve } from 'node:path'
import { Exec, Module, File, Path } from '@athenna/common'
import { Annotation, type ServiceMeta } from '@athenna/ioc'
import { CronExceptionHandler } from '#src/handlers/CronExceptionHandler'

const rTracerPlugin = await Module.safeImport('cls-rtracer')

export class CronKernel {
  /**
   * Register the cls-rtracer plugin in the Cron.
   */
  public async registerRTracer(trace?: boolean): Promise<void> {
    if (trace === false) {
      debug(
        'Not able to register rTracer plugin. Set the trace option as true in your cron options.'
      )

      return
    }

    if (trace === undefined && Config.is('cron.rTracer.enabled', false)) {
      debug(
        'Not able to register rTracer plugin. Set the cron.rTracer.enabled configuration as true.'
      )

      return
    }

    if (!rTracerPlugin) {
      debug('Not able to register tracer plugin. Install cls-rtracer package.')

      return
    }

    CronBuilder.registerRTracer(rTracerPlugin)
  }

  /**
   * Register the exception handler for all Cron tasks.
   */
  public async registerExceptionHandler(path?: string) {
    if (!path) {
      CronBuilder.exceptionHandler = new CronExceptionHandler()

      return
    }

    const Handler = await Module.resolve(path, this.getParentURL())

    CronBuilder.exceptionHandler = new Handler()
  }

  /**
   * Register all the schedulers found inside "rc.schedulers" config
   * inside the service provider.
   */
  public async registerSchedulers(): Promise<void> {
    const schedulers = Config.get<string[]>('rc.schedulers', [])

    await Exec.concurrently(schedulers, async path => {
      const Scheduler = await Module.resolve(path, this.getParentURL())

      if (Annotation.isAnnotated(Scheduler)) {
        this.registerUsingMeta(Scheduler)

        return
      }

      ioc.transient(`App/Cron/Schedulers/${Scheduler.name}`, Scheduler)
    })
  }

  /**
   * Register the route file by importing the file.
   */
  public async registerRoutes(path: string) {
    if (path.startsWith('#')) {
      await Module.resolve(path, this.getParentURL())

      return
    }

    if (!isAbsolute(path)) {
      path = resolve(path)
    }

    if (!(await File.exists(path))) {
      return
    }

    await Module.resolve(path, this.getParentURL())
  }

  /**
   * Register the schedulers using the meta information
   * defined by annotations.
   */
  private registerUsingMeta(target: any): ServiceMeta {
    const meta = Annotation.getMeta(target)
    const builder = Cron.schedule()

    ioc[meta.type](meta.alias, target)

    if (meta.name) {
      builder.name(meta.name)
      ioc.alias(meta.name, meta.alias)
    }

    if (meta.camelAlias) {
      ioc.alias(meta.camelAlias, meta.alias)
    }

    builder
      .pattern(meta.pattern)
      .timezone(meta.timezone)
      .scheduled(meta.scheduled)
      .runOnInit(meta.runOnInit)
      .recoverMissedExecutions(meta.recoverMissedExecutions)
      .handler(ctx => {
        const scheduler =
          ioc.use(meta.name) ||
          ioc.use(meta.camelAlias) ||
          ioc.safeUse(meta.alias)

        return scheduler.handler(ctx)
      })

    return meta
  }

  /**
   * Get the parent URL of the project.
   */
  private getParentURL() {
    return Config.get('rc.parentURL', Path.toHref(Path.pwd() + sep))
  }
}
