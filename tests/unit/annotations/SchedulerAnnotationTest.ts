/**
 * @athenna/cron
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Annotation } from '@athenna/ioc'
import { BaseTest } from '#tests/helpers/BaseTest'
import { Test, type Context, Cleanup } from '@athenna/test'

export default class SchedulerAnnotationTest extends BaseTest {
  @Test()
  public async shouldBeAbleToPreregisterSchedulersUsingSchedulerAnnotation({ assert }: Context) {
    const ProductScheduler = await this.import('#tests/fixtures/schedulers/ProductScheduler')

    const metadata = Annotation.getMeta(ProductScheduler)

    assert.isFalse(metadata.registered)
    assert.isUndefined(metadata.camelAlias)
    assert.equal(metadata.type, 'transient')
    assert.equal(metadata.alias, 'App/Cron/Schedulers/ProductScheduler')
  }

  @Test()
  @Cleanup(() => ioc.reconstruct())
  public async shouldNotReRegisterTheSchedulerIfItIsAlreadyRegisteredInTheServiceContainer({ assert }: Context) {
    ioc.singleton('App/Cron/Schedulers/ProductScheduler', () => {})

    const ProductScheduler = await this.import('#tests/fixtures/schedulers/ProductScheduler')

    assert.isFalse(Annotation.isAnnotated(ProductScheduler))
  }
}
