const { IqbiClient } = require('../integrations/iqbi-client');

module.exports = {
  mapElectricityPayload: IqbiClient.mapElectricityPayload,
  mapGasPayload: IqbiClient.mapGasPayload,
  mapWaterPayload: IqbiClient.mapWaterPayload,
  mapPlugPayload: IqbiClient.mapPlugPayload,
  mapSensorPayload: IqbiClient.mapSensorPayload
};
