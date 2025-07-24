import Category from '#models/category'
import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class CategoryController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('categories')
    return user.categories
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const schema = vine.object({ name: vine.string().trim().minLength(1) })
    const { name } = await vine.compile(schema).validate(request.all())

    const category = await Category.create({ name, userId: user.id })
    return category
  }

  /**
   * Handle form submission for the update action
   */
  async update({ params, request }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    const schema = vine.object({ name: vine.string().trim().minLength(1) })
    const { name } = await vine.compile(schema).validate(request.all())

    category.name = name
    await category.save()

    return category
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const category = await Category.findOrFail(params.id)
    await category.delete()
    return { message: 'Category deleted successfully' }
  }
}