import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'calculadora'
})

export class CalculadoraPipe implements PipeTransform {
	
	//dato | calculadora: otrodato
	//param1				param2
	transform(value1:any, value2:any){
		let operaciones = `
			Suma: ${value1 + value2} -
			Resta: ${value1 - value2} -
			Multiplicacion: ${value1 * value2} -
			Division: ${value1 / value2}
		`;
		return operaciones;
	}
}