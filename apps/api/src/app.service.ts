import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  healthCheck() {
    return { status: 'ok', service: 'thep-cuoi-api' }
  }
}
