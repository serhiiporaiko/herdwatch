import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ToastService {

  touchStart: number;
  disconnectedToast: HTMLIonToastElement;
  isShowed: boolean;

  constructor(
    private toast: ToastController) {
  }

  async showSuccessToast(message?: string) {
    let toast = await this.toast.create({
      message: message || 'Success',
      position: 'top',
      cssClass: 'custom_toast',
      color: 'success',
      duration: 5000
    });
    toast.present().then(() => this.handleToastSwipe(toast));
  }

  async showInfoToast(message?: string) {
    let toast = await this.toast.create({
      message: message || 'Info',
      position: 'top',
      cssClass: 'custom_toast',
      color: "warning",
      duration: 7000
    });
    toast.present().then(() => this.handleToastSwipe(toast));
  }

  async showErrorToast(message?: string) {
    let toast = await this.toast.create({
      message: message || 'Something went wrong!',
      position: 'top',
      cssClass: 'custom_toast',
      color: 'danger',
      duration: 5000
    });
    toast.present().then(() => this.handleToastSwipe(toast));
  }

  handleToastSwipe(toast: HTMLIonToastElement) {
    let id = toast.id;
    let element = document.getElementById(id);
    let startHandler = (e: TouchEvent) => this.touchStart = e.touches[0].clientY;
    let moveHandler = (e: TouchEvent) => {
      element.removeEventListener('touchstart', startHandler);
      element.removeEventListener('touchmove', moveHandler);
      setTimeout(() => {
        if (toast && document.getElementById(id) && (this.touchStart - e.touches[0].clientY > 0)) {
          toast.dismiss();
        };
      }, 50);
    };
    element.addEventListener('touchstart', startHandler);
    element.addEventListener('touchmove', moveHandler);
  }

  dismissDisconnected() {
    if (this.isShowed && this.disconnectedToast) {
      this.disconnectedToast.dismiss();
    }
    this.isShowed = false;
  }
}