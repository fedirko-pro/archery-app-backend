import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req?.headers?.authorization as string | undefined;
    if (!authHeader?.toLowerCase().startsWith('bearer ')) {
      return true;
    }
    return super.canActivate(context);
  }
}
