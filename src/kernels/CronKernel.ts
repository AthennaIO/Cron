import { sep } from 'node:path'
import { Module, Path } from '@athenna/common'
import { CronBuilder } from '#src/cron/CronBuilder'
import { CronExceptionHandler } from '#src/handlers/CronExceptionHandler'

export class CronKernel {
  /**
   * Register the exception handler for all Cron tasks.
   */
  public async registerExceptionHandler(path?: string) {
    if (!path) {
      const handler = new CronExceptionHandler()

      CronBuilder.exceptionHandler = handler.handle.bind(handler)

      return
    }

    const Handler = await Module.resolve(path, this.getParentURL())
    const handler = new Handler()

    CronBuilder.exceptionHandler = handler.handle.bind(handler)
  }

  /**
   * Get the parent URL of the project.
   */
  private getParentURL() {
    return Config.get('rc.parentURL', Path.toHref(Path.pwd() + sep))
  }
}
