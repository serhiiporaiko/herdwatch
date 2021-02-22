import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { UserModel } from '../models/user.interface';
import { HeadersService } from './headers.service';
import { LoadingService } from './loading.service';
import { ToastService } from './toast.service';

export enum UpdateMethod {
  ADD = 'post',
  UPDATE = 'patch',
  DELETE = 'delete'
}

@Injectable({
  providedIn: 'root'
})

export class UsersService {

  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private storage: SQLiteObject;
  public API_URL = 'https://serhiiporaiko.stoplight.io/mocks/serhiiporaiko/test-api/6387134/';
  public UPDATE_METHOD = UpdateMethod;
  public users$: BehaviorSubject<UserModel[]> = new BehaviorSubject([]);

  constructor(
    private http: HttpClient,
    private loading: LoadingService,
    private headers: HeadersService,
    private platform: Platform,
    private sqlite: SQLite,
    private sqlPorter: SQLitePorter,
    private toast: ToastService) {

    this.platform.ready().then(() => {
      this.sqlite.create({
        name: '__native.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.storage = db;
          this.storage.executeSql('select * from usertable', [])
            .then(() => this.getListDb())
            .catch(() => {
              this.storage.executeSql('CREATE TABLE IF NOT EXISTS usertable (id INTEGER PRIMARY KEY AUTOINCREMENT, firstName TEXT, lastName TEXT, email TEXT, dateOfBirth TEXT, emailVerified BOOLEAN, createDate TEXT, updateMethod TEXT, syncFailed BOOLEAN)', [])
                .then(() => this.getListDb(true))
                .catch(err => console.log(err));
            });
        });
    });
  }

  dbState() {
    return this.isDbReady.asObservable();
  }

  getInitList() {
    this.getList()
      .subscribe(data => {
        const json = {
          "data": {
            "inserts": {
              "usertable": data
            },
          }
        };

        this.sqlPorter.importJsonToDb(this.storage, json)
          .then(() => {
            this.getListDb();
            this.isDbReady.next(true);
          })
          .catch(error => console.error(error));
      });
  }

  getListDb(isInit?: boolean) {
    return this.storage.executeSql('SELECT * FROM usertable', []).then(res => {
      let items: UserModel[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          items.push({
            id: res.rows.item(i).id,
            firstName: res.rows.item(i).firstName,
            lastName: res.rows.item(i).lastName,
            email: res.rows.item(i).email,
            dateOfBirth: res.rows.item(i).dateOfBirth,
            emailVerified: !!res.rows.item(i).emailVerified,
            createDate: res.rows.item(i).createDate,
            updateMethod: res.rows.item(i).updateMethod,
            syncFailed: res.rows.item(i).syncFailed,
          });
        }
        this.users$.next(items);
      } else {
        isInit ? this.getInitList() : this.users$.next([]);
      }
    });
  }

  // getUser(id): Promise<UserModel> {
  //   return this.storage.executeSql('SELECT * FROM usertable WHERE id = ?', [id]).then(res => {
  //     return {
  //       id: res.rows.item(0).id,
  //       firstName: res.rows.item(0).firstName,
  //       lastName: res.rows.item(0).lastName,
  //       email: res.rows.item(0).email,
  //       dateOfBirth: res.rows.item(0).dateOfBirth,
  //       emailVerified: !!res.rows.item(0).emailVerified,
  //       createDate: res.rows.item(0).createDate,
  //       updateMethod: res.rows.item(0).updateMethod,
  //       syncFailed: res.rows.item(0).syncFailed,
  //     }
  //   });
  // }

  setDb(user: UserModel, notRefresh?: boolean) {
    user.updateMethod = this.UPDATE_METHOD.ADD;
    user.createDate = new Date(Date.now()).toISOString().slice(0, 10);
    user.emailVerified = false;

    const keys = Object.keys(user);
    const symArr = Array.from({ length: keys.length }, () => '?');
    const statement = `INSERT INTO usertable (${keys.join(', ')}) VALUES (${symArr.join(', ')})`;

    return this.storage.executeSql(statement, Object.values(user))
      .then(() => {
        if (!notRefresh) {
          this.getListDb();
        }
        this.toast.showSuccessToast('User successfully created');
      })
      .catch(() => this.toast.showErrorToast());
  }

  updateDb(id: number, user, updateMethod: string, isShowToast: boolean, notRefresh?: boolean) {
    const userData = user ? { ...user } : {};
    if (updateMethod && userData.updateMethod !== UpdateMethod.ADD) {
      userData.updateMethod = updateMethod;
    } else if (!updateMethod) {
      if (userData.updateMethod) {
        delete userData.updateMethod;
      }
      if (userData.syncFailed) {
        delete userData.syncFailed
      }
      if (userData.syncFailed && userData.updateMethod !== UpdateMethod.DELETE && updateMethod === UpdateMethod.DELETE) {
        userData.sybcFailed = null;
      }
    }

    if (userData.id) {
      delete userData.id;
    }
    let keys = Object.keys(userData);
    keys = keys.map(k => `${k} = ?`);
    const statement = `UPDATE usertable SET ${keys.join(', ')} WHERE id = ${id}`;
    return this.storage.executeSql(statement, Object.values(userData))
      .then(() => {
        if (!notRefresh) {
          this.getListDb();
        }
        if (isShowToast) {
          this.toast.showSuccessToast(updateMethod === UpdateMethod.DELETE ? 'User successfully deleted' : 'User info successfully updated');
        }
      })
      .catch(() => this.toast.showErrorToast());
  }

  deleteDb(id: number, notRefresh?: boolean) {
    return this.storage.executeSql('DELETE FROM usertable WHERE id = ?', [id])
      .then(() => {
        if (!notRefresh) {
          this.getListDb();
        }
      });
  }

  getList(): Observable<UserModel[]> {
    // return of(MockUsersList.users);
    return this.http.get<UserModel[]>(`${this.API_URL}users`);
  };

  set(user: UserModel, isShowToast?: boolean) {

    const obs = this.http.post(`${this.API_URL}users/${user.id}`, user, this.headers.createAnonymousJSONOptions()).pipe(shareReplay());
    obs.subscribe(() => {
      this.updateDb(user.id, user, null, false, !isShowToast);
      if (isShowToast) {
        this.toast.showSuccessToast();
      }
    }, err => {
      user.syncFailed = true;
      this.updateDb(user.id, user, UpdateMethod.ADD, false, !isShowToast);
      if (isShowToast) {
        this.toast.showErrorToast(err.message);
      }
    });
    return obs;
  }

  update(user, isShowToast?: boolean) {
    const id = user.id;
    const obs = this.http.put(`${this.API_URL}users/${id}`, user, this.headers.createAnonymousJSONOptions()).pipe(shareReplay());
    obs.subscribe(() => {
      this.updateDb(id, user, null, false, !isShowToast);
      if (isShowToast) {
        this.toast.showSuccessToast();
      }
    }, err => {
      user.syncFailed = true;
      this.updateDb(user.id, user, UpdateMethod.UPDATE, false, !isShowToast);
      if (isShowToast) {
        this.toast.showErrorToast(err.message);
      }
    });
    return obs;
  }

  delete(user, isShowToast?: boolean) {

    const obs = this.http.delete(`${this.API_URL}users/${user.id}`, user).pipe(shareReplay());
    obs.subscribe(() => {
      this.deleteDb(user.id, !isShowToast);
      if (isShowToast) {
        this.toast.showSuccessToast();
      }
    }, err => {
      user.syncFailed = true;
      this.updateDb(user.id, user, UpdateMethod.DELETE, false, !isShowToast);
      if (isShowToast) {
        this.toast.showErrorToast(err.message);
      }
    });
    return obs;
  }

  async syncList(users: UserModel[]) {
    {
      const loading = await this.loading.present();
      let isFailed = false;
      try {
        for (let i = 0; i < users.length; i++) {
          const obs = users[i].updateMethod === UpdateMethod.ADD
            ? this.set(users[i])
            : users[i].updateMethod === UpdateMethod.UPDATE
              ? this.update(users[i])
              : this.delete(users[i]);
          const promise = obs.toPromise();
          try {
            await promise;
          } catch (error) {
            isFailed = true;
          }
        }
      }
      finally {
        this.loading.dismiss(loading);
        if (isFailed) {
          this.toast.showErrorToast();
        } else {
          this.toast.showSuccessToast('Successfully synchronized');
        }
        this.getListDb();
        // TODO sync users list by api if mock api is resolve it
      }
    }
  }

}