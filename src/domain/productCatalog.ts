// Product choices derived from the shared Salaman product-name sheet (Trang tính1, column A).
export interface ProductVariant {
  color: string;
  value: string;
}

export interface ProductOption {
  name: string;
  variants: ProductVariant[];
}

export const PRODUCT_CATALOG: ProductOption[] = [
  {
    "name": "Dây sạc 60W SLM SX C to C 1M cao su non (SLM-PSCC60-02)",
    "variants": [
      {
        "color": "Xanh",
        "value": "Dây sạc 60W SLM SX C to C 1M cao su non - Xanh (SLM-PSCC60-02)"
      },
      {
        "color": "Tím",
        "value": "Dây sạc 60W SLM SX C to C 1M cao su non - Tím (SLM-PSCC60-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SX C to L 1M cao su non (SLM-PSCL-02)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 27W SLM SX C to L 1M cao su non - Trắng (SLM-PSCL-02)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 27W SLM SX C to L 1M cao su non - Đen (SLM-PSCL-02)"
      },
      {
        "color": "Xanh",
        "value": "Dây sạc 27W SLM SX C to L 1M cao su non - Xanh (SLM-PSCL-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SF C to L 1M bọc dù (SLM-PSCL-03)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 27W SLM SF C to L 1M bọc dù - Trắng (SLM-PSCL-03)"
      },
      {
        "color": "Tím",
        "value": "Dây sạc 27W SLM SF C to L 1M bọc dù - Tím (SLM-PSCL-03)"
      }
    ]
  },
  {
    "name": "Dây Sạc PD60W IP15 Dù C To C Hộp Store * (FRE VAT)",
    "variants": [
      {
        "color": "",
        "value": "Dây Sạc PD60W IP15 Dù C To C Hộp Store * (FRE VAT)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W NG AirFan (SLM-PB-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Sạc dự phòng 10.000mAh 22.5W NG AirFan - Trắng (SLM-PB-01)"
      },
      {
        "color": "Đen",
        "value": "Sạc dự phòng 10.000mAh 22.5W NG AirFan - Đen (SLM-PB-01)"
      },
      {
        "color": "Xanh",
        "value": "Sạc dự phòng 10.000mAh 22.5W NG AirFan - Xanh (SLM-PB-01)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W 2 dây sạc Lensmate (SLM-PB-02)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Sạc dự phòng 10.000mAh 22.5W 2 dây sạc Lensmate - Trắng (SLM-PB-02)"
      },
      {
        "color": "Xanh",
        "value": "Sạc dự phòng 10.000mAh 22.5W 2 dây sạc Lensmate - Xanh (SLM-PB-02)"
      },
      {
        "color": "Tím",
        "value": "Sạc dự phòng 10.000mAh 22.5W 2 dây sạc Lensmate - Tím (SLM-PB-02)"
      },
      {
        "color": "Cam",
        "value": "Sạc dự phòng 10.000mAh 22.5W 2 dây sạc Lensmate - Cam (SLM-PB-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM C to L 1M GS MFI vật liệu cao cấp (SLM-PSCL-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 27W SLM C to L 1M GS MFI vật liệu cao cấp - Trắng (SLM-PSCL-01)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM C to C 1M GS vật liệu cao cấp (SLM-PSCC60-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 60W SLM C to C 1M GS vật liệu cao cấp - Trắng (SLM-PSCC60-01)"
      }
    ]
  },
  {
    "name": "Giá Đỡ Điện Thoại Hợp Kim T11 - Gerlax Tặng",
    "variants": [
      {
        "color": "",
        "value": "Giá Đỡ Điện Thoại Hợp Kim T11 - Gerlax Tặng"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W SLM quạt tản nhiệt Airfan (SLM-PB10-01)",
    "variants": [
      {
        "color": "Xanh Dương",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM quạt tản nhiệt Airfan - Xanh Dương (SLM-PB10-01)"
      },
      {
        "color": "Đen",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM quạt tản nhiệt Airfan - Đen (SLM-PB10-01)"
      },
      {
        "color": "Trắng",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM quạt tản nhiệt Airfan - Trắng (SLM-PB10-01)"
      },
      {
        "color": "Xanh Lá",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM quạt tản nhiệt Airfan - Xanh lá (SLM-PB10-01)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 35W SLM 2 dây sạc SF Tatto (SLM-PB10-03)",
    "variants": [
      {
        "color": "Xanh",
        "value": "Sạc dự phòng 10.000mAh 35W SLM 2 dây sạc SF Tatto - Xanh (SLM-PB10-03)"
      },
      {
        "color": "Trắng",
        "value": "Sạc dự phòng 10.000mAh 35W SLM 2 dây sạc SF Tatto - Trắng (SLM-PB10-03)"
      },
      {
        "color": "Đen",
        "value": "Sạc dự phòng 10.000mAh 35W SLM 2 dây sạc SF Tatto - Đen (SLM-PB10-03)"
      }
    ]
  },
  {
    "name": "Củ sạc 20W SLM SF GaN (SLM-PD20-02)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Củ sạc 20W SLM SF GaN - Trắng (SLM-PD20-02)"
      },
      {
        "color": "Đen",
        "value": "Củ sạc 20W SLM SF GaN - Đen (SLM-PD20-02)"
      }
    ]
  },
  {
    "name": "Củ sạc 30W SLM SF GaN (SLM-PD30-02)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Củ sạc 30W SLM SF GaN - Trắng (SLM-PD30-02)"
      },
      {
        "color": "Đen",
        "value": "Củ sạc 30W SLM SF GaN - Đen (SLM-PD30-02)"
      }
    ]
  },
  {
    "name": "Củ sạc 20W SLM SX GaN (SLM-PD20-01)",
    "variants": [
      {
        "color": "Xanh",
        "value": "Củ sạc 20W SLM SX GaN - Xanh (SLM-PD20-01)"
      },
      {
        "color": "Tím",
        "value": "Củ sạc 20W SLM SX GaN - Tím (SLM-PD20-01)"
      }
    ]
  },
  {
    "name": "Củ sạc 30W SLM SX GaN (SLM-PD30-01)",
    "variants": [
      {
        "color": "Xanh",
        "value": "Củ sạc 30W SLM SX GaN - Xanh (SLM-PD30-01)"
      },
      {
        "color": "Tím",
        "value": "Củ sạc 30W SLM SX GaN - Tím (SLM-PD30-01)"
      }
    ]
  },
  {
    "name": "Dây sạc 100W SLM EA C to C 1M bọc dù (SLM-PSCC100-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 100W SLM EA C to C 1M bọc dù - Trắng (SLM-PSCC100-01)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 100W SLM EA C to C 1M bọc dù - Đen (SLM-PSCC100-01)"
      }
    ]
  },
  {
    "name": "Dây sạc 100W SLM EA C to C 2M bọc dù (SLM-PSCC100-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 100W SLM EA C to C 2M bọc dù - Trắng (SLM-PSCC100-01)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 100W SLM EA C to C 2M bọc dù - Đen (SLM-PSCC100-01)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SX C to L 1M cao su non - Tím # (SLM-PSCL-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SX C to L 1M cao su non - Tím # (SLM-PSCL-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SX C to L 2M cao su non - Trắng # (SLM-PSCL-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SX C to L 2M cao su non - Trắng # (SLM-PSCL-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SX C to L 2M cao su non - Đen # (SLM-PSCL-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SX C to L 2M cao su non - Đen # (SLM-PSCL-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SX C to L 2M cao su non - Xanh # (SLM-PSCL-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SX C to L 2M cao su non - Xanh # (SLM-PSCL-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SX C to L 2M cao su non - Tím # (SLM-PSCL-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SX C to L 2M cao su non - Tím # (SLM-PSCL-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SX C to C 1M cao su non - Trắng # (SLM-PSCC60-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SX C to C 1M cao su non - Trắng # (SLM-PSCC60-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SX C to C 1M cao su non - Đen # (SLM-PSCC60-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SX C to C 1M cao su non - Đen # (SLM-PSCC60-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SX C to C 2M cao su non - Trắng # (SLM-PSCC60-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SX C to C 2M cao su non - Trắng # (SLM-PSCC60-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SX C to C 2M cao su non - Đen # (SLM-PSCC60-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SX C to C 2M cao su non - Đen # (SLM-PSCC60-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SX C to C 2M cao su non - Xanh # (SLM-PSCC60-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SX C to C 2M cao su non - Xanh # (SLM-PSCC60-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SX C to C 2M cao su non - Tím # (SLM-PSCC60-02)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SX C to C 2M cao su non - Tím # (SLM-PSCC60-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SF C to L 1M bọc dù - Đen # $(SLM-PSCL-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SF C to L 1M bọc dù - Đen # $(SLM-PSCL-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SF C to L 1M bọc dù - Xanh # $(SLM-PSCL-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SF C to L 1M bọc dù - Xanh # $(SLM-PSCL-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SF C to L 2M bọc dù - Trắng # (SLM-PSCL-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SF C to L 2M bọc dù - Trắng # (SLM-PSCL-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SF C to L 2M bọc dù - Đen # (SLM-PSCL-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SF C to L 2M bọc dù - Đen # (SLM-PSCL-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SF C to L 2M bọc dù - Xanh # (SLM-PSCL-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SF C to L 2M bọc dù - Xanh # (SLM-PSCL-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SF C to L 2M bọc dù - Tím # (SLM-PSCL-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 27W SLM SF C to L 2M bọc dù - Tím # (SLM-PSCL-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 1M bọc dù - Trắng # $(SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 1M bọc dù - Trắng # $(SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 1M bọc dù - Đen # $(SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 1M bọc dù - Đen # $(SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 1M bọc dù - Xanh # $(SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 1M bọc dù - Xanh # $(SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 1M bọc dù - Tím # $(SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 1M bọc dù - Tím # $(SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 2M bọc dù - Trắng # (SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 2M bọc dù - Trắng # (SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 2M bọc dù - Đen # (SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 2M bọc dù - Đen # (SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 2M bọc dù - Xanh # (SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 2M bọc dù - Xanh # (SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SF C to C 2M bọc dù - Tím # (SLM-PSCC60-03)",
    "variants": [
      {
        "color": "",
        "value": "Dây sạc 60W SLM SF C to C 2M bọc dù - Tím # (SLM-PSCC60-03)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SR C to L 1M tự cuộn bọc dù (SLM-PSCL-05)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 27W SLM SR C to L 1M tự cuộn bọc dù - Trắng (SLM-PSCL-05)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 27W SLM SR C to L 1M tự cuộn bọc dù - Đen (SLM-PSCL-05)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SR C to C 1M tự cuộn bọc dù (SLM-PSCC60-05)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 60W SLM SR C to C 1M tự cuộn bọc dù - Trắng (SLM-PSCC60-05)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 60W SLM SR C to C 1M tự cuộn bọc dù - Đen (SLM-PSCC60-05)"
      }
    ]
  },
  {
    "name": "Dây sạc 100W SLM ST 2 đầu 1.2M bọc dù (SLM-PSCCL100-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 100W SLM ST 2 đầu 1.2M bọc dù - Trắng (SLM-PSCCL100-01)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 100W SLM ST 2 đầu 1.2M bọc dù - Đen (SLM-PSCCL100-01)"
      }
    ]
  },
  {
    "name": "Dây sạc 100W SLM SV C to C 1M bọc dù (SLM-PSCC100-02)",
    "variants": [
      {
        "color": "Đen",
        "value": "Dây sạc 100W SLM SV C to C 1M bọc dù - Đen (SLM-PSCC100-02)"
      },
      {
        "color": "Trắng",
        "value": "Dây sạc 100W SLM SV C to C 1M bọc dù - Trắng (SLM-PSCC100-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 100W SLM SV C to C 2M bọc dù (SLM-PSCC100-02)",
    "variants": [
      {
        "color": "Đen",
        "value": "Dây sạc 100W SLM SV C to C 2M bọc dù - Đen (SLM-PSCC100-02)"
      },
      {
        "color": "Trắng",
        "value": "Dây sạc 100W SLM SV C to C 2M bọc dù - Trắng (SLM-PSCC100-02)"
      }
    ]
  },
  {
    "name": "Dây sạc 60W SLM SP 2 đầu 1.2M bọc dù (SLM-PSCCL60-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 60W SLM SP 2 đầu 1.2M bọc dù - Trắng (SLM-PSCCL60-01)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 60W SLM SP 2 đầu 1.2M bọc dù - Đen (SLM-PSCCL60-01)"
      }
    ]
  },
  {
    "name": "Giá đỡ SLM từ tính nam châm N52 (SLM-PH-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Giá đỡ SLM từ tính nam châm N52 - Trắng (SLM-PH-01)"
      },
      {
        "color": "Đen",
        "value": "Giá đỡ SLM từ tính nam châm N52 - Đen (SLM-PH-01)"
      }
    ]
  },
  {
    "name": "Củ sạc 20W SLM EA GaN - Đen (SLM-PD20-05) KT",
    "variants": [
      {
        "color": "",
        "value": "Củ sạc 20W SLM EA GaN - Đen (SLM-PD20-05) KT"
      }
    ]
  },
  {
    "name": "Củ sạc 30W SLM EA GaN - Trắng (SLM-PD30-05) KT",
    "variants": [
      {
        "color": "",
        "value": "Củ sạc 30W SLM EA GaN - Trắng (SLM-PD30-05) KT"
      }
    ]
  },
  {
    "name": "Vòng từ tính hút nam châm",
    "variants": [
      {
        "color": "",
        "value": "Vòng từ tính hút nam châm"
      }
    ]
  },
  {
    "name": "Túi Da Eva Salaman",
    "variants": [
      {
        "color": "",
        "value": "Túi Da Eva Salaman"
      }
    ]
  },
  {
    "name": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Trắng $ (SLM-CK20-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Trắng $ (SLM-CK20-01)"
      }
    ]
  },
  {
    "name": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Đen $ (SLM-CK20-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Đen $ (SLM-CK20-01)"
      }
    ]
  },
  {
    "name": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Xanh $ (SLM-CK20-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Xanh $ (SLM-CK20-01)"
      }
    ]
  },
  {
    "name": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Tím $ (SLM-CK20-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 20W SLM ES GaN C to L bọc dù - Tím $ (SLM-CK20-01)"
      }
    ]
  },
  {
    "name": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Trắng $ (SLM-CK30-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Trắng $ (SLM-CK30-01)"
      }
    ]
  },
  {
    "name": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Đen $ (SLM-CK30-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Đen $ (SLM-CK30-01)"
      }
    ]
  },
  {
    "name": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Xanh $ (SLM-CK30-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Xanh $ (SLM-CK30-01)"
      }
    ]
  },
  {
    "name": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Tím $ (SLM-CK30-01)",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 30W SLM ES GaN C to C bọc dù - Tím $ (SLM-CK30-01)"
      }
    ]
  },
  {
    "name": "Tẩu Sạc 55W SLM SF 2 cổng (SLM-CCCA-02)",
    "variants": [
      {
        "color": "Xám",
        "value": "Tẩu Sạc 55W SLM SF 2 cổng - Xám (SLM-CCCA-02)"
      }
    ]
  },
  {
    "name": "Tẩu Sạc 55W SLM EA 2 cổng (SLM-CCCA-01)",
    "variants": [
      {
        "color": "Đen",
        "value": "Tẩu Sạc 55W SLM EA 2 cổng - Đen (SLM-CCCA-01)"
      }
    ]
  },
  {
    "name": "Củ sạc 30W SLM GS GaNPro (SLM-PD30-06)",
    "variants": [
      {
        "color": "Đen",
        "value": "Củ sạc 30W SLM GS GaNPro - Đen (SLM-PD30-06)"
      },
      {
        "color": "Trắng",
        "value": "Củ sạc 30W SLM GS GaNPro - Trắng (SLM-PD30-06)"
      }
    ]
  },
  {
    "name": "Tai Nghe AP3 Salaman Nano Semi in-ear SN01 (SLM-TWS-SN01)$",
    "variants": [
      {
        "color": "",
        "value": "Tai Nghe AP3 Salaman Nano Semi in-ear SN01 (SLM-TWS-SN01)$"
      }
    ]
  },
  {
    "name": "Tai Nghe AP Pro2 Salaman Nano In-ear SN02 (SLM-TWS-SN02)$",
    "variants": [
      {
        "color": "",
        "value": "Tai Nghe AP Pro2 Salaman Nano In-ear SN02 (SLM-TWS-SN02)$"
      }
    ]
  },
  {
    "name": "Tai nghe chống ồn xuyên âm Salaman Edge AirLumen in-ear (SLM-TWS-SE01NC)",
    "variants": [
      {
        "color": "Đen",
        "value": "Tai nghe chống ồn xuyên âm Salaman Edge AirLumen in-ear - Đen (SLM-TWS-SE01NC)"
      },
      {
        "color": "Trắng",
        "value": "Tai nghe chống ồn xuyên âm Salaman Edge AirLumen in-ear - Trắng (SLM-TWS-SE01NC)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W SLM 2 dây sạc GoPower - Trắng $ (SLM-PB10-04)",
    "variants": [
      {
        "color": "",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM 2 dây sạc GoPower - Trắng $ (SLM-PB10-04)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W SLM 2 dây sạc GoPower - Đen $ (SLM-PB10-04)",
    "variants": [
      {
        "color": "",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM 2 dây sạc GoPower - Đen $ (SLM-PB10-04)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 20.000mAh 22.5W SLM 2 dây sạc GoPower - Trắng $ (SLM-PB20-04)",
    "variants": [
      {
        "color": "",
        "value": "Sạc dự phòng 20.000mAh 22.5W SLM 2 dây sạc GoPower - Trắng $ (SLM-PB20-04)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 20.000mAh 22.5W SLM 2 dây sạc GoPower - Đen $ (SLM-PB20-04)",
    "variants": [
      {
        "color": "",
        "value": "Sạc dự phòng 20.000mAh 22.5W SLM 2 dây sạc GoPower - Đen $ (SLM-PB20-04)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W SLM XSlim dây TypeC (SLM-PB10C-05)",
    "variants": [
      {
        "color": "Xám",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM XSlim dây TypeC - Xám (SLM-PB10C-05)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W SLM XSlim dây Lightning (SLM-PB10L-05)",
    "variants": [
      {
        "color": "Xám",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM XSlim dây Lightning - Xám (SLM-PB10L-05)"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 14Pro/15/16",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 14Pro/15/16"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 14PM/15P/16P",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 14PM/15P/16P"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 15Pro",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 15Pro"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 15PM",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 15PM"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 16Pro/17",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 16Pro/17"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 16PM",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 16PM"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 17Air",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 17Air"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 17Pro",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 17Pro"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống nhìn trộm 360 - 17PM",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống nhìn trộm 360 - 17PM"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 14Pro/15/16",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 14Pro/15/16"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 14PM/15P/16P",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 14PM/15P/16P"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 15Pro",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 15Pro"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 15PM",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 15PM"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 16Pro/17",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 16Pro/17"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 16PM",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 16PM"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 17Air",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 17Air"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 17Pro/18Pro",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 17Pro/18Pro"
      }
    ]
  },
  {
    "name": "Cường lực SLM chống chói tăng nét - 17Prm/18Prm",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM chống chói tăng nét - 17Prm/18Prm"
      }
    ]
  },
  {
    "name": "Cường Lực X/XS/11PRO Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực X/XS/11PRO Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực XR/11 Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực XR/11 Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực XSM/11PRM Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực XSM/11PRM Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 12/12PRO Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 12/12PRO Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 12PRM Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 12PRM Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 13/13PRO/14 Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 13/13PRO/14 Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 13PRM/14PLUS Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 13PRM/14PLUS Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 14PRO Salaman- Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 14PRO Salaman- Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 14PRM Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 14PRM Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 15/16 Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15/16 Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 15PRO Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15PRO Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 15PLUS/16PLUS Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15PLUS/16PLUS Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 15PRM Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15PRM Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 16PRO Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 16PRO Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 16PRM Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 16PRM Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 17Prm/18Prm Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17Prm/18Prm Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 17Pro/18Pro Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17Pro/18Pro Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 17 Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17 Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực 17AIR Salaman - Tự Dán",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17AIR Salaman - Tự Dán"
      }
    ]
  },
  {
    "name": "Cường Lực X/XS/11PRO Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực X/XS/11PRO Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực XR/11 Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực XR/11 Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực XSM/11PRM Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực XSM/11PRM Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 12/12PRO Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 12/12PRO Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 12PRM Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 12PRM Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 13/13PRO/14 Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 13/13PRO/14 Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 13PRM/14PLUS Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 13PRM/14PLUS Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 14PRO Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 14PRO Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 14PRM Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 14PRM Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 15/16 Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15/16 Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 15PRO Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15PRO Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 15PLUS/16PLUS Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15PLUS/16PLUS Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 15PRM Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 15PRM Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 16PRO Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 16PRO Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 16PRM Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 16PRM Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 17Prm/18Prm Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17Prm/18Prm Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 17Pro/18Pro Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17Pro/18Pro Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 17AIR Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17AIR Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Cường Lực 17 Full Màn Salaman - Viền Titan",
    "variants": [
      {
        "color": "",
        "value": "Cường Lực 17 Full Màn Salaman - Viền Titan"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W SLM Future dây TypeC (SLM-PB10-06C)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM Future dây TypeC - Trắng (SLM-PB10-06C)"
      },
      {
        "color": "Đen",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM Future dây TypeC - Đen (SLM-PB10-06C)"
      }
    ]
  },
  {
    "name": "Sạc dự phòng 10.000mAh 22.5W SLM Future dây Lightning (SLM-PB10-06L)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM Future dây Lightning - Trắng (SLM-PB10-06L)"
      },
      {
        "color": "Đen",
        "value": "Sạc dự phòng 10.000mAh 22.5W SLM Future dây Lightning - Đen (SLM-PB10-06L)"
      }
    ]
  },
  {
    "name": "Dây sạc mini Future C to C (SLM-PSMCC-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc mini Future C to C - Trắng (SLM-PSMCC-01)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc mini Future C to C - Đen (SLM-PSMCC-01)"
      }
    ]
  },
  {
    "name": "Dây sạc mini Future C to L (SLM-PSMCL-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc mini Future C to L - Trắng (SLM-PSMCL-01)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc mini Future C to L - Đen (SLM-PSMCL-01)"
      }
    ]
  },
  {
    "name": "Củ sạc 3 cổng 65W SLM GS GaNPro (SLM-PD65-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Củ sạc 3 cổng 65W SLM GS GaNPro - Trắng (SLM-PD65-01)"
      },
      {
        "color": "Đen",
        "value": "Củ sạc 3 cổng 65W SLM GS GaNPro - Đen (SLM-PD65-01)"
      }
    ]
  },
  {
    "name": "Củ sạc 60W SLM SK Dynamic Power GaN (SLM-PD60-01)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Củ sạc 60W SLM SK Dynamic Power GaN - Trắng (SLM-PD60-01)"
      },
      {
        "color": "Cam",
        "value": "Củ sạc 60W SLM SK Dynamic Power GaN - Cam (SLM-PD60-01)"
      }
    ]
  },
  {
    "name": "Dây sạc 65W SLM SK C to C 1M bọc dù (SLM-PSCC65-06)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 65W SLM SK C to C 1M bọc dù - Trắng (SLM-PSCC65-06)"
      },
      {
        "color": "Cam",
        "value": "Dây sạc 65W SLM SK C to C 1M bọc dù - Cam (SLM-PSCC65-06)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 65W SLM SK C to C 1M bọc dù - Đen (SLM-PSCC65-06)"
      }
    ]
  },
  {
    "name": "Dây sạc 27W SLM SK C to L 1M bọc dù (SLM-PSCL-06)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Dây sạc 27W SLM SK C to L 1M bọc dù - Trắng (SLM-PSCL-06)"
      },
      {
        "color": "Cam",
        "value": "Dây sạc 27W SLM SK C to L 1M bọc dù - Cam (SLM-PSCL-06)"
      },
      {
        "color": "Đen",
        "value": "Dây sạc 27W SLM SK C to L 1M bọc dù - Đen (SLM-PSCL-06)"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - XR/11 $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - XR/11 $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - X/XS/11Pro $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - X/XS/11Pro $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - XSMax/11Promax $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - XSMax/11Promax $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 13Pro/13/14/16e $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 13Pro/13/14/16e $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 13Promax/14Plus $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 13Promax/14Plus $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 14Pro $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 14Pro $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 14Promax $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 14Promax $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 15/16 $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 15/16 $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 15Pro $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 15Pro $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 15Plus/16Plus $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 15Plus/16Plus $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 15Promax $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 15Promax $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 16Pro/17 $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 16Pro/17 $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 16Promax $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 16Promax $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 17Air $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 17Air $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 17Pro/18Pro",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 17Pro/18Pro"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 17Prm/18Prm",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 17Prm/18Prm"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 12/12Pro $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 12/12Pro $"
      }
    ]
  },
  {
    "name": "Cường lực SLM không viền - 12Promax $",
    "variants": [
      {
        "color": "",
        "value": "Cường lực SLM không viền - 12Promax $"
      }
    ]
  },
  {
    "name": "Quạt cầm tay mini gió 100 Salaman Ice Fan Pro02SE (SLM-HF-CFP02)",
    "variants": [
      {
        "color": "Đen",
        "value": "Quạt cầm tay mini gió 100 Salaman Ice Fan Pro02SE - Đen (SLM-HF-CFP02)"
      },
      {
        "color": "Trắng",
        "value": "Quạt cầm tay mini gió 100 Salaman Ice Fan Pro02SE - Trắng (SLM-HF-CFP02)"
      }
    ]
  },
  {
    "name": "Quạt mini cầm tay gió 199 Salaman Ice Fan Plus01SE (SLM-HF-CF01)",
    "variants": [
      {
        "color": "Cam",
        "value": "Quạt mini cầm tay gió 199 Salaman Ice Fan Plus01SE - Cam (SLM-HF-CF01)"
      },
      {
        "color": "Trắng",
        "value": "Quạt mini cầm tay gió 199 Salaman Ice Fan Plus01SE - Trắng (SLM-HF-CF01)"
      },
      {
        "color": "Hồng",
        "value": "Quạt mini cầm tay gió 199 Salaman Ice Fan Plus01SE - Hồng (SLM-HF-CF01)"
      }
    ]
  },
  {
    "name": "Quạt cầm tay gió 199 Salaman Ice Fan Plus03SE (SLM-HF-CF03)",
    "variants": [
      {
        "color": "Trắng",
        "value": "Quạt cầm tay gió 199 Salaman Ice Fan Plus03SE - Trắng (SLM-HF-CF03)"
      },
      {
        "color": "Hồng",
        "value": "Quạt cầm tay gió 199 Salaman Ice Fan Plus03SE - Hồng (SLM-HF-CF03)"
      }
    ]
  },
  {
    "name": "Thiết bị định vị toàn cầu Salaman Huthur Round Tag",
    "variants": [
      {
        "color": "",
        "value": "Thiết bị định vị toàn cầu Salaman Huthur Round Tag"
      }
    ]
  },
  {
    "name": "Tai nghe Salaman Edge AirSence Open ear",
    "variants": [
      {
        "color": "Vàng Sa Mạc",
        "value": "Tai nghe Salaman Edge AirSence Open ear - Vàng Sa Mạc"
      },
      {
        "color": "Xám Kim Loại",
        "value": "Tai nghe Salaman Edge AirSence Open ear - Xám Kim Loại"
      }
    ]
  },
  {
    "name": "Bộ sạc 65W SLM GS Gold Edition C to C",
    "variants": [
      {
        "color": "",
        "value": "Bộ sạc 65W SLM GS Gold Edition C to C"
      }
    ]
  }
];
