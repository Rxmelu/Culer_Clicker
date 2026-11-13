import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
  IonButton, ModalController, IonContent, IonIcon 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  restaurant, school, trendingUp, volumeHigh, 
  flash, shirt, gitNetwork, trophy, ribbon, 
  beer, alert 
} from 'ionicons/icons';
import itemsData from '../../../assets/data/itemsData.json';

export interface Item {
  name: string;
  description: string;
  price: number;
  icon: string;
  tipo?: string;
  nivel?: number;
  unico?: boolean;
}

@Component({
  selector: 'shop-component',
  templateUrl: 'shop.component.html',
  styleUrls: ['./shop.component.scss'],
  imports: [
    IonIcon, FormsModule, IonButton, CommonModule, IonContent
  ],
})
export class ShopComponent implements OnInit {
  items: Item[] = []; 
  clicks: number = 0;

  constructor(private modalController: ModalController) {
    addIcons({ 
      restaurant, school, 'trending-up': trendingUp, 'volume-high': volumeHigh,
      flash, shirt, 'git-network': gitNetwork, trophy, ribbon, beer, alert
    });
  }

  ngOnInit() {
    this.clicks = Number(localStorage.getItem('clicks')) || 0;
    
    const nivelMasiaActual = Number(localStorage.getItem('nivelMasia')) || 0;
    const nivelCampNouActual = Number(localStorage.getItem('nivelCampNou')) || 0;
    const nivelLionelActual = Number(localStorage.getItem('nivelLionel')) || 0;
    const madridDestruido = localStorage.getItem('madridDestruido') === 'true';

    this.items = itemsData.items.filter(item => {
      if (!item.tipo) return true;

      if (item.tipo === 'destruir_madrid') {
        return !madridDestruido;
      }

      if (item.tipo === 'lionel') {
        return item.nivel === (nivelLionelActual + 1);
      }
      if (item.tipo === 'masia') {
        return item.nivel === (nivelMasiaActual + 1);
      }
      if (item.tipo === 'campnou') {
        return item.nivel === (nivelCampNouActual + 1);
      }
      
      return true;
    });
  }

  buyItem(item: Item) {
    return this.modalController.dismiss(item, 'buy');
  }
}