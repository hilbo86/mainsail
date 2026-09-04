import { describe, expect, it } from 'vitest'
import MiscellaneousSensor from '@/components/panels/Miscellaneous/MiscellaneousSensor.vue'

const createSensor = (value: number, decimalPlaces: number) =>
    new MiscellaneousSensor({
        propsData: {
            name: 'rail_voltage',
            type: 'analog_input',
            value,
            unit: 'V',
            decimalPlaces,
        },
    })

describe('MiscellaneousSensor', () => {
    it('keeps trailing zeros for analog input values', () => {
        expect(createSensor(12.2, 2).output).toBe('12.20 V')
    })

    it('honors the configured number of decimal places', () => {
        expect(createSensor(12.194, 3).output).toBe('12.194 V')
    })
})
