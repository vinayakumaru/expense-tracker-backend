import Category from '#models/category'
import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class CategoryController {
  async index({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const categories = await Category.query().where('userId', user.id)
    return categories
  }

  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const schema = vine.object({ name: vine.string().trim().minLength(1) })
    const { name } = await vine.compile(schema).validate(request.all())

    const category = await Category.create({ name, userId: user.id })
    return category
  }

  async update({ params, request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const category = await Category.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()

    const schema = vine.object({ name: vine.string().trim().minLength(1) })
    const { name } = await vine.compile(schema).validate(request.all())

    category.name = name
    await category.save()

    return category
  }

  async destroy({ params, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const category = await Category.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .firstOrFail()
      
    await category.delete()
    return { message: 'Category deleted successfully' }
  }
}