export interface ServerSensorState {
    sensors: {
        [key: string]: ServerSensorStateSensor
    }
}

export interface ServerSensorStateSensor {
    error?: string | null
    friendly_name: string
    id: string
    parameter_info?: ServerSensorParameterInfo[]
    type: string
    values: {
        [key: string]: number
    }
}

export interface ServerSensorParameterInfo {
    name: string
    units?: string
    [key: string]: string | undefined
}
