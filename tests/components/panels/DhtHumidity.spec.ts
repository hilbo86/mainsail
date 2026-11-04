import { afterEach, describe, expect, it } from 'vitest'
import Vue from 'vue'
import Vuex from 'vuex'
import TemperaturePanelListItem from '@/components/panels/Temperature/TemperaturePanelListItem.vue'
import AdditionalSensor from '@/components/panels/Temperature/TemperaturePanelListItemAdditionalSensor.vue'
import AdditionalSensorValue from '@/components/panels/Temperature/TemperaturePanelListItemAdditionalSensorValue.vue'
import SensorSettings from '@/components/panels/Temperature/TemperaturePanelListItemEdit.vue'

Vue.use(Vuex)

const instances: { $destroy(): void }[] = []
afterEach(() => instances.splice(0).forEach((instance) => instance.$destroy()))

const createStatus = (humidity: number | null = 65.8) => ({
    temperature: humidity === null ? null : 24.6,
    humidity,
    valid: humidity !== null,
    last_error: 'OK',
    age_seconds: 1,
    ok_count: 42,
    checksum_errors: 0,
    timeout_errors: 0,
    protocol_errors: 0,
    range_errors: 0,
})

const createStore = (status = createStatus()) =>
    new Vuex.Store({
        state: {
            printer: {
                'temperature_sensor chamber': { temperature: 24.6 },
                'dht_status chamber': status,
            },
        },
        getters: { 'gui/getDatasetAdditionalSensorValue': () => () => true },
    })

describe('DHT dashboard humidity', () => {
    it('finds the DHT object belonging to the temperature sensor', () => {
        const item = new TemperaturePanelListItem({
            store: createStore(),
            propsData: { objectName: 'temperature_sensor chamber', isResponsiveMobile: false },
        })
        instances.push(item)
        expect(item.additionalSensorName).toBe('dht_status chamber')
    })

    it('offers only humidity in the row and its settings, keeping diagnostic fields out of numeric rendering', () => {
        const store = createStore()
        const additionalSensor = new AdditionalSensor({
            store,
            propsData: { objectName: 'temperature_sensor chamber', additionalObjectName: 'dht_status chamber' },
        })
        const settings = new SensorSettings({
            store,
            propsData: {
                objectName: 'temperature_sensor chamber',
                name: 'chamber',
                formatName: 'Chamber',
                additionalSensorName: 'dht_status chamber',
                icon: '',
                color: '#ffffff',
            },
        })
        instances.push(additionalSensor, settings)
        expect(additionalSensor.additionalValues).toEqual(['humidity'])
        expect(settings.additionalValues).toEqual(['humidity'])
    })

    it('formats humidity and hides it when the host marks the value stale', async () => {
        const status = createStatus()
        const value = new AdditionalSensorValue({
            store: createStore(status),
            propsData: {
                printerObject: status,
                objectName: 'temperature_sensor chamber',
                sensorType: 'dht_status',
                keyName: 'humidity',
            },
        })
        instances.push(value)
        expect(value.isVisible).toBe(true)
        expect(value.formatValue).toBe('65.8 %')
        status.valid = false
        status.humidity = null
        await Vue.nextTick()
        expect(value.isVisible).toBe(false)
    })

    it('does not show an initial missing measurement as zero percent', () => {
        const value = new AdditionalSensorValue({
            store: createStore(),
            propsData: {
                printerObject: createStatus(null),
                objectName: 'temperature_sensor chamber',
                sensorType: 'dht_status',
                keyName: 'humidity',
            },
        })
        instances.push(value)
        expect(value.isVisible).toBe(false)
    })

    it('continues to discover and display the existing AHT humidity object', () => {
        const store = new Vuex.Store({ state: { printer: { 'aht10 chamber': { temperature: 24.6, humidity: 55 } } } })
        const item = new TemperaturePanelListItem({
            store,
            propsData: { objectName: 'temperature_sensor chamber', isResponsiveMobile: false },
        })
        const additionalSensor = new AdditionalSensor({
            store,
            propsData: { objectName: 'temperature_sensor chamber', additionalObjectName: 'aht10 chamber' },
        })
        instances.push(item, additionalSensor)
        expect(item.additionalSensorName).toBe('aht10 chamber')
        expect(additionalSensor.additionalValues).toEqual(['humidity'])
    })
})
