import { Exception } from '@athenna/common'

export class NotFoundTaskNameException extends Exception {
  public constructor(name: string) {
    const status = 500
    const help = `You need to define a scheduler with name ({yellow} "${name}") in your route file or set the name in your scheduler annotation.`
    const code = 'E_NOT_FOUND_TASK'
    const message = `The scheduler with name ({yellow} "${name}") does not exist.`

    super({ code, help, status, message })
  }
}
