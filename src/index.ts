declare const confetti: any;

interface ShipmentDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

interface CalculationResult {
  baseRate: number;
  dimWeight: number;
  billableWeight: number;
  finalRate: number;
  rateDetails: string[];
}

type WeightUnit = 'oz' | 'lb';
type ServiceLevel = 'ground' | 'expedited' | 'expressPlus';
type Zone = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

class XparcelCalculator {
  private readonly groundRates = {
    pounds: {
      '1': [
        5.04, 5.38, 6.05, 6.53, 6.82, 7.12, 7.43, 7.67, 7.93, 8.27, 9.83, 10.33, 10.85, 11.3, 11.87,
        12.94, 13.23, 13.57, 13.88, 14.5, 15.11, 15.76, 16.26, 17.17, 17.77,
      ],
      '2': [
        5.12, 5.45, 6.21, 6.55, 6.86, 7.15, 7.48, 7.69, 7.97, 8.3, 9.86, 10.36, 10.85, 11.31, 11.88,
        13.09, 13.4, 13.75, 14.09, 14.9, 15.11, 15.76, 16.64, 17.57, 17.78,
      ],
      '3': [
        5.35, 5.51, 6.77, 7.25, 7.64, 8.1, 8.53, 8.85, 9.16, 9.56, 11.64, 12.16, 12.68, 13.15,
        13.56, 13.9, 14.26, 14.64, 15.01, 15.95, 17.75, 19.41, 20.41, 20.47, 21.05,
      ],
      '4': [
        5.46, 6.07, 7.04, 7.6, 8.15, 8.72, 9.27, 9.65, 10.12, 10.68, 12.68, 13.28, 13.86, 14.39,
        14.86, 15.28, 15.7, 16.13, 16.55, 17.12, 18.72, 20.66, 23.47, 23.82, 24.75,
      ],
      '5': [
        5.66, 6.66, 7.84, 8.53, 9.34, 10.0, 10.72, 11.15, 11.78, 12.44, 14.21, 14.86, 15.52, 16.17,
        16.83, 17.46, 17.92, 18.44, 18.95, 20.01, 22.38, 25.25, 29.19, 30.5, 31.62,
      ],
      '6': [
        5.92, 7.34, 8.65, 9.66, 10.41, 11.18, 11.99, 12.52, 13.27, 14.03, 15.97, 16.73, 17.51,
        18.31, 19.11, 19.88, 20.4, 21.02, 21.62, 23.32, 27.09, 31.42, 33.52, 34.82, 36.11,
      ],
      '7': [
        6.08, 7.48, 9.18, 10.29, 11.34, 12.14, 13.31, 14.02, 14.92, 15.85, 18.18, 19.1, 20.01,
        20.95, 21.87, 22.76, 23.41, 24.15, 24.87, 27.46, 32.51, 37.34, 37.35, 38.83, 40.55,
      ],
      '8': [
        6.25, 7.89, 9.65, 10.94, 12.29, 13.53, 14.7, 15.61, 16.73, 17.86, 20.91, 22.06, 23.22,
        24.38, 25.52, 26.63, 27.47, 28.41, 29.32, 31.72, 36.83, 39.8, 41.9, 44.05, 45.52,
      ],
    },
    ounces: {
      '1': Array(15).fill(3.2),
      '2': Array(15).fill(3.22),
      '3': Array(15).fill(3.25),
      '4': Array(15).fill(3.33),
      '5': Array(15).fill(3.38),
      '6': Array(15).fill(3.46),
      '7': Array(15).fill(3.48),
      '8': Array(15).fill(3.53),
    },
  };

  private calculateDimWeight(dimensions: ShipmentDimensions): number {
    const { length, width, height } = dimensions;
    const dimWeight = (length * width * height) / 166;
    console.log(`Dimensional weight calculated: ${dimWeight}`);
    return dimWeight;
  }

  public calculateRate(
    dimensions: ShipmentDimensions,
    weightUnit: WeightUnit,
    serviceLevel: ServiceLevel,
    zone: Zone
  ): CalculationResult {
    console.log('Starting calculation with inputs:', dimensions, weightUnit, serviceLevel, zone);

    const dimWeight = this.calculateDimWeight(dimensions);
    let billableWeight = dimensions.weight;
    let finalRate = 0;
    const rateDetails: string[] = [];

    if (weightUnit === 'oz') {
      if (dimensions.weight >= 16) {
        billableWeight = Math.ceil(dimensions.weight / 16);
        const poundIndex = Math.min(billableWeight - 1, 24);
        finalRate = this.groundRates.pounds[zone][poundIndex];
        rateDetails.push(`Weight converted to ${billableWeight} lb(s)`);
      } else {
        const ounceIndex = Math.min(Math.floor(dimensions.weight) - 1, 14);
        finalRate = this.groundRates.ounces[zone][ounceIndex];
        rateDetails.push(`Using ${dimensions.weight} oz rate`);
      }
    } else {
      const dimWeightLbs = Math.ceil(dimWeight);
      billableWeight = Math.max(Math.ceil(dimensions.weight), dimWeightLbs);
      const poundIndex = Math.min(billableWeight - 1, 24);
      finalRate = this.groundRates.pounds[zone][poundIndex];

      if (dimWeightLbs > dimensions.weight) {
        rateDetails.push(`Dimensional weight applied: ${dimWeightLbs} lbs`);
      }
      rateDetails.push(`Using ${billableWeight} lb rate`);
    }

    console.log('Service Level received for calculation:', serviceLevel);

    if (serviceLevel === 'expedited') {
      finalRate += 0.05;
      rateDetails.push('Expedited service: +$0.05');
      console.log('Added expedited fee: +$0.05');
    } else if (serviceLevel === 'expressPlus') {
      finalRate += 0.11;
      rateDetails.push('Express Plus service: +$0.11');
      console.log('Added expressPlus fee: +$0.11');
    }

    rateDetails.push(`Service Level: ${serviceLevel.toUpperCase()}`);
    rateDetails.push(`Zone: ${zone}`);

    console.log('Final calculation:', { dimWeight, billableWeight, finalRate, rateDetails });

    return {
      baseRate: finalRate,
      dimWeight,
      billableWeight,
      finalRate,
      rateDetails,
    };
  }
}

window.Webflow ||= [];
window.Webflow.push(() => {
  console.log('Initializing shipping calculator...');

  const form = document.querySelector<HTMLFormElement>('[fs-element="form"]');
  const rateDisplay = document.querySelector<HTMLElement>('#text-rate');

  if (!form || !rateDisplay) {
    console.error('Form or display element not found.');
    return;
  }

  const calculator = new XparcelCalculator();

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Form submitted. Retrieving inputs...');

    const length = Number(document.querySelector<HTMLInputElement>('#Length-rate')?.value || 0);
    const width = Number(document.querySelector<HTMLInputElement>('#Width-rate')?.value || 0);
    const height = Number(document.querySelector<HTMLInputElement>('#Height-rate')?.value || 0);
    const weight = Number(document.querySelector<HTMLInputElement>('#Weight-rate')?.value || 0);

    const zoneElement = document.querySelector<HTMLSelectElement>('#Zone');
    const serviceLevelElement = document.querySelector<HTMLSelectElement>('#Service-Level');

    if (!zoneElement || !serviceLevelElement) {
      console.error('Zone or Service Level dropdown not found.');
      rateDisplay.textContent = 'Error: Missing required fields.';
      return;
    }

    const zone = zoneElement.value.replace('Zone ', '') as Zone;
    const serviceLevel = serviceLevelElement.value as ServiceLevel;

    const isOz = document.querySelector<HTMLInputElement>('#oz')?.checked || false;
    const isLb = document.querySelector<HTMLInputElement>('#lbs-checkbox')?.checked || false;

    const weightUnit: WeightUnit = isLb ? 'lb' : 'oz';

    console.log({ length, width, height, weight, zone, serviceLevel, weightUnit });

    if (!length || !width || !height || !weight) {
      console.error('Missing required fields.');
      rateDisplay.textContent = 'Error: Missing required fields.';
      return;
    }

    const dimensions: ShipmentDimensions = { length, width, height, weight };
    const result = calculator.calculateRate(dimensions, weightUnit, serviceLevel, zone);

    rateDisplay.textContent = `$${result.finalRate.toFixed(2)}`;
    console.log('Calculation result:', result);

    const textRateSmall = document.querySelector<HTMLElement>('#text-rate-small');
    if (textRateSmall) textRateSmall.textContent = `$${result.finalRate.toFixed(2)}`;

    confetti({
      particleCount: 150,
      spread: 150,
      origin: { x: 0.5, y: 0.5 },
    });
  });
});
