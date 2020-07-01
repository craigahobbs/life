/* eslint-disable quotes */
export const lifeTypes =
{
    "Color": {
        "typedef": {
            "attr": {
                "len_gt": 0
            },
            "doc": " A CSS color string",
            "name": "Color",
            "type": {
                "builtin": "string"
            }
        }
    },
    "CommandEmpty": {
        "struct": {
            "doc": " An empty command struct",
            "name": "CommandEmpty"
        }
    },
    "CommandLoad": {
        "struct": {
            "doc": " Load command struct",
            "members": [
                {
                    "doc": " The serialized life board in the format \"<width>-<height>-<[01]{width * height}>\"",
                    "name": "data",
                    "type": {
                        "builtin": "string"
                    }
                },
                {
                    "doc": " If true, the load agument is not cleared (default is \"false\")",
                    "name": "save",
                    "optional": true,
                    "type": {
                        "builtin": "bool"
                    }
                }
            ],
            "name": "CommandLoad"
        }
    },
    "CommandPlay": {
        "struct": {
            "doc": " Play command struct",
            "members": [
                {
                    "doc": " If true, the simulation is paused (default is \"false\")",
                    "name": "pause",
                    "optional": true,
                    "type": {
                        "builtin": "bool"
                    }
                }
            ],
            "name": "CommandPlay"
        }
    },
    "CommandToggle": {
        "struct": {
            "doc": " Cell toggle command struct",
            "members": [
                {
                    "attr": {
                        "gte": 0.0
                    },
                    "doc": " The cell's X coordinate",
                    "name": "x",
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "gte": 0.0
                    },
                    "doc": " The cell's Y coordinate",
                    "name": "y",
                    "type": {
                        "builtin": "int"
                    }
                }
            ],
            "name": "CommandToggle"
        }
    },
    "Life": {
        "struct": {
            "doc": " The Life application hash parameters struct",
            "members": [
                {
                    "doc": " The Life application command",
                    "name": "cmd",
                    "optional": true,
                    "type": {
                        "user": "LifeCommand"
                    }
                },
                {
                    "attr": {
                        "gte": 5.0,
                        "lte": 1000.0
                    },
                    "doc": " The horizontal width of the cell grid (default is 50)",
                    "name": "width",
                    "optional": true,
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "gte": 5.0,
                        "lte": 1000.0
                    },
                    "doc": " The vertical height of the cell grid (default is 50)",
                    "name": "height",
                    "optional": true,
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "gte": 2.0,
                        "lte": 100.0
                    },
                    "doc": " The size, in pixels, of a cell (default is 10)",
                    "name": "size",
                    "optional": true,
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "gte": 0.0,
                        "lte": 10.0
                    },
                    "doc": " The gap, in pixels, between cells (default is 1)",
                    "name": "gap",
                    "optional": true,
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "gte": 0.0001,
                        "lte": 60.0
                    },
                    "doc": " The simulation iteration period, in seconds (default is 0.5 seconds)",
                    "name": "period",
                    "optional": true,
                    "type": {
                        "builtin": "float"
                    }
                },
                {
                    "attr": {
                        "gte": 0.0,
                        "lte": 1000.0
                    },
                    "doc": " The generation depth used to check for cycles (default is 6)",
                    "name": "depth",
                    "optional": true,
                    "type": {
                        "builtin": "int"
                    }
                },
                {
                    "attr": {
                        "gte": 0.0,
                        "lte": 1.0
                    },
                    "doc": " The probability, from zero to one, that a cell will be living at startup (default is 0.25)",
                    "name": "lifeRatio",
                    "optional": true,
                    "type": {
                        "builtin": "float"
                    }
                },
                {
                    "attr": {
                        "gte": 0.0,
                        "lte": 0.45
                    },
                    "doc": " The size ratio of the lifeless border around the life board at startup (default is 0.1)",
                    "name": "lifeBorder",
                    "optional": true,
                    "type": {
                        "builtin": "float"
                    }
                },
                {
                    "doc": " The cell fill color (default is \"#2a803b\")",
                    "name": "fill",
                    "optional": true,
                    "type": {
                        "user": "Color"
                    }
                },
                {
                    "doc": " The cell stroke color (default is \"none\")",
                    "name": "stroke",
                    "optional": true,
                    "type": {
                        "user": "Stroke"
                    }
                },
                {
                    "doc": " The cell stroke width (default is 1)",
                    "name": "strokeWidth",
                    "optional": true,
                    "type": {
                        "user": "StrokeWidth"
                    }
                },
                {
                    "doc": " The board fill color (default is \"#ffffff\")",
                    "name": "bgFill",
                    "optional": true,
                    "type": {
                        "user": "Color"
                    }
                },
                {
                    "doc": " The board stroke color (default is \"none\")",
                    "name": "bgStroke",
                    "optional": true,
                    "type": {
                        "user": "Stroke"
                    }
                },
                {
                    "doc": " The board stroke width (default is 1)",
                    "name": "bgStrokeWidth",
                    "optional": true,
                    "type": {
                        "user": "StrokeWidth"
                    }
                }
            ],
            "name": "Life"
        }
    },
    "LifeCommand": {
        "struct": {
            "doc": " The Life application command union",
            "members": [
                {
                    "doc": " The life board state is loaded",
                    "name": "load",
                    "type": {
                        "user": "CommandLoad"
                    }
                },
                {
                    "doc": " The simulation is run (default)",
                    "name": "play",
                    "type": {
                        "user": "CommandPlay"
                    }
                },
                {
                    "doc": " The simulation is stepped and paused",
                    "name": "step",
                    "type": {
                        "user": "CommandEmpty"
                    }
                },
                {
                    "doc": " The simulation state is randomized",
                    "name": "reset",
                    "type": {
                        "user": "CommandEmpty"
                    }
                },
                {
                    "doc": " The simulation state is cleared",
                    "name": "clear",
                    "type": {
                        "user": "CommandEmpty"
                    }
                },
                {
                    "doc": " Toggle a cell",
                    "name": "toggle",
                    "type": {
                        "user": "CommandToggle"
                    }
                }
            ],
            "name": "LifeCommand",
            "union": true
        }
    },
    "Stroke": {
        "typedef": {
            "attr": {
                "len_gt": 0
            },
            "doc": " A CSS stroke string",
            "name": "Stroke",
            "type": {
                "builtin": "string"
            }
        }
    },
    "StrokeWidth": {
        "typedef": {
            "attr": {
                "gte": 0.0,
                "lte": 10.0
            },
            "doc": " A CSS stroke width",
            "name": "StrokeWidth",
            "type": {
                "builtin": "int"
            }
        }
    }
};
