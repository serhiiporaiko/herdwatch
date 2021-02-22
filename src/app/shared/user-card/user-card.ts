import { Component, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserModel } from '../../models/user.interface';
import { LoadingService } from '../../providers/loading.service';
import { UpdateMethod, UsersService } from '../../providers/users.service';

@Component({
  selector: 'user-card-component',
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.scss'],
})

export class UserCardComponent {

  @Input('user') user: UserModel;

  constructor(
    private loading: LoadingService,
    private router: Router,
    private usersService: UsersService) { }

  openUserEditPage() {
    let navigationExtras: NavigationExtras = {
      state: {
        user: this.user
      }
    };
    this.router.navigate(['user-edit'], navigationExtras);
  }

  async sync(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const loading = await this.loading.present();
    const obs = this.user.updateMethod === UpdateMethod.ADD
      ? this.usersService.set(this.user, true)
      : this.user.updateMethod === UpdateMethod.UPDATE
        ? this.usersService.update(this.user, true)
        : this.usersService.delete(this.user, true);
    obs.subscribe(() => this.loading.dismiss(loading), () => this.loading.dismiss(loading));
  }

  // async presentConfirm(event) {
  //   if(event) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   }
  //   const alert = await this.alert.create({
  //     header: 'Delete user',
  //     message: 'Are you shure?',
  //     buttons: [{
  //       text: 'Cancel',
  //       role: 'cancel',
  //       handler: () => { }
  //     }, {
  //       text: 'Ok',
  //       handler: () => this.usersDbService.deleteUser(this.user.id)
  //     }]
  //   });
  //   await alert.present();
  // }

}