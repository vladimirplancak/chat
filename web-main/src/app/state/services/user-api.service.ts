import * as ngCore from '@angular/core';
import * as models from '../../models';
import * as rxjs from 'rxjs'

@ngCore.Injectable()
export class UserApiService {
  public list(): rxjs.Observable<readonly models.User[]> {
    return rxjs.of([])
  }

  public get(id: models.User.Id): rxjs.Observable<models.User | undefined> {
    return rxjs.of(undefined)
  }

}