<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Specify external systems and integration points

External systems and integration points for this ETL-listed 0.55 kW converter-fed IE4 asynchronous motor (model 80SQ/4) primarily involve electrical power, control signaling and mechanical coupling in industrial drive applications.[^10]

## Electrical power integration

- **Incoming power supply**
Three‑phase 230 V AC mains/grid supply connects to the external VSD input terminals via upstream protection (MCB/fuses, isolator) and optional EMC filter.[^10]
Integration point: VSD AC input terminals (L1/L2/L3, PE earth).
- **Variable speed drive (VSD)**
Mandatory external component; motor terminals (U/V/W, PE) connect directly to VSD inverter output for multi‑phase PWM supply.[^10]
Integration point: Motor power cable (shielded, gland entry) to VSD motor output.


## Control and monitoring integration

- **Building/process controller**
PLC, BMS or SCADA system sends analog/digital speed/torque setpoints (4-20 mA, 0-10 V, Modbus RTU/TCP, Profibus, Ethernet/IP) to VSD control terminals or network ports.[^10]
Integration point: VSD control I/O or fieldbus/Ethernet port.
- **Sensors and feedback devices**
External pressure/flow/temperature/speed sensors wire to VSD analog/digital inputs or controller for closed‑loop operation; optional encoder on motor shaft for precise feedback.[^10]
Integration point: VSD multi‑function I/O terminals (AI/AO/DI/DO/relay).


## Mechanical and operational integration

- **Driven equipment**
Pump, fan, conveyor, compressor or gearbox couples to motor shaft via flexible coupling, belt drive or direct flange mount.[^10]
Integration point: Motor shaft/flange (IEC standard frame, assumed 80 frame size from model code).
- **Site infrastructure**
Motor mounts to baseplate/skid; ventilation/cooling air from site ducting; possible integration with condition monitoring systems (vibration/current analysis).[^10]
Integration point: Mounting feet, terminal box glands.

This architecture enables the motor to integrate into retrofit or new variable‑speed motor systems, with ETL listing confirming verified efficiency for procurement compliance.[^10]
<span style="display:none">[^1][^2][^3][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://help.relativity.com/RelativityOne/Content/Relativity/Integration_Points/Relativity_Integration_Points.htm

[^2]: https://spoors.in/tutorials/Integrator/IntegrationwithExternalSystems.html

[^3]: https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/faspf/overview-of-linking-to-external-systems-with-context.html

[^4]: https://www.alumio.com/blog/common-system-integration-practices-compared

[^5]: https://www.sciencedirect.com/topics/computer-science/integration-point

[^6]: https://www.linkedin.com/advice/1/how-can-you-identify-integration-points-between-mfnoc

[^7]: https://docs.pega.com/bundle/pega-cloud/page/pega-cloud/pc/pega-cloud-integrate-with-pega-platform-rules-services-overview.html

[^8]: https://wesolved.com/blog/odoo-2/how-to-set-up-integrations-with-other-systems-52

[^9]: https://docs.esko.com/docs/en-us/automationengine/24.03/userguide/pdf/ae_AEINTegrationEXTSYST.pdf

[^10]: https://etl.energysecurity.gov.uk/product-search/product/86411

