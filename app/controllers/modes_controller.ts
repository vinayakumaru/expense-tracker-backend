import Mode from '#models/mode'
import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class ModeController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('modes')
    return user.modes
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const schema = vine.object({ name: vine.string().trim().minLength(1) })
    const { name } = await vine.compile(schema).validate(request.all())

    const mode = await Mode.create({ name, userId: user.id })
    return mode
  }

  /**
   * Handle form submission for the update action
   */
  async update({ params, request }: HttpContext) {
    const mode = await Mode.findOrFail(params.id)
    const schema = vine.object({ name: vine.string().trim().minLength(1) })
    const { name } = await vine.compile(schema).validate(request.all())

    mode.name = name
    await mode.save()

    return mode
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const mode = await Mode.findOrFail(params.id)
    await mode.delete()
    return { message: 'Mode deleted successfully' }
  }
}