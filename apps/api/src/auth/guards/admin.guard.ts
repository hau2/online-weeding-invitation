import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user as { app_role?: string } | undefined

    if (!user || user.app_role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập trang này')
    }

    return true
  }
}
