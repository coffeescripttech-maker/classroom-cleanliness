# 🔍 Detected Objects Reference

## YOLOv8 Detection Capabilities

The system uses YOLOv8 trained on the COCO dataset, which can detect **80 object classes**.

## 🎓 Classroom-Relevant Objects

### 🪑 Furniture (Orderliness Scoring)
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| chair | Chairs, stools | Checked for alignment with desks |
| couch | Sofas, couches | Checked for arrangement |
| dining table | Desks, tables | Used as reference for chair alignment |
| bed | Beds | Checked for arrangement |

### 🗑️ Trash & Waste
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| bottle | Plastic/glass bottles | Clutter penalty if on floor/desk |
| cup | Cups, mugs | Clutter penalty |
| bowl | Bowls | Clutter penalty |

### 🎒 Clutter Items (High Penalty)
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| backpack | School bags | -1.5 points per item |
| handbag | Bags, purses | -1.5 points per item |
| suitcase | Luggage | -1.5 points per item |
| umbrella | Umbrellas | -1.5 points per item |
| book | Books (if scattered) | -1.5 points per item |
| cell phone | Mobile phones | -1.5 points per item |

### 💻 Electronics
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| laptop | Laptops | Clutter if left out |
| keyboard | Keyboards | Clutter if misplaced |
| mouse | Computer mice | Clutter if misplaced |
| tv | Television/monitor | Tracked for inventory |
| remote | Remote controls | Clutter if left out |

### 🍽️ Food & Drinks (Should Not Be Present)
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| banana | Fruits | Clutter penalty |
| apple | Fruits | Clutter penalty |
| orange | Fruits | Clutter penalty |
| sandwich | Food items | Clutter penalty |
| pizza | Food | Clutter penalty |
| donut | Snacks | Clutter penalty |
| cake | Snacks | Clutter penalty |
| hot dog | Food | Clutter penalty |
| carrot | Vegetables | Clutter penalty |
| broccoli | Vegetables | Clutter penalty |

### 📚 School Supplies
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| scissors | Scissors | Tracked |
| clock | Wall clocks | Tracked |
| vase | Decorative items | Tracked |
| potted plant | Plants | Tracked |

### 🎮 Toys & Recreation
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| teddy bear | Toys | Clutter penalty |
| sports ball | Balls | Clutter penalty |
| frisbee | Recreation items | Clutter penalty |
| kite | Recreation items | Clutter penalty |

### 👤 People
| Object | Description | Impact on Score |
|--------|-------------|-----------------|
| person | Students, teachers | Tracked but not scored |

## 📋 Complete COCO Dataset (80 Classes)

### People & Animals
1. person
2. bicycle
3. car
4. motorcycle
5. airplane
6. bus
7. train
8. truck
9. boat
10. bird
11. cat
12. dog
13. horse
14. sheep
15. cow
16. elephant
17. bear
18. zebra
19. giraffe

### Outdoor Objects
20. traffic light
21. fire hydrant
22. stop sign
23. parking meter
24. bench

### Furniture
25. chair
26. couch
27. potted plant
28. bed
29. dining table

### Electronics
30. tv
31. laptop
32. mouse
33. remote
34. keyboard
35. cell phone

### Kitchen & Dining
36. microwave
37. oven
38. toaster
39. sink
40. refrigerator
41. book
42. clock
43. vase
44. scissors
45. teddy bear
46. hair drier
47. toothbrush

### Food & Drinks
48. bottle
49. wine glass
50. cup
51. fork
52. knife
53. spoon
54. bowl
55. banana
56. apple
57. sandwich
58. orange
59. broccoli
60. carrot
61. hot dog
62. pizza
63. donut
64. cake

### Sports & Recreation
65. sports ball
66. kite
67. baseball bat
68. baseball glove
69. skateboard
70. surfboard
71. tennis racket
72. frisbee
73. skis
74. snowboard

### Personal Items
75. backpack
76. umbrella
77. handbag
78. tie
79. suitcase

## 🎯 How Objects Affect Scoring

### Floor Cleanliness (10 points)
**Penalized objects on floor:**
- backpack, handbag, bottle, book, cell phone, cup, paper, bag
- **Penalty:** -1.5 points per item (max -5)

### Furniture Orderliness (10 points)
**Checked objects:**
- Chairs must be aligned with tables/desks
- Furniture should be arranged in rows
- **Penalty:** -4 for poor alignment, -3 for poor arrangement

**Surface clutter:**
- bottle, cup, book, cell phone, backpack, handbag
- **Penalty:** -0.5 per item on desk surface (max -3)

### Trash Bin Condition (10 points)
**Trash items:**
- bottle, cup, paper, plastic, bag
- **Penalty:** -2 per item outside bins (max -4)

### Clutter Detection (10 points)
**All clutter objects:**
- backpack, handbag, bottle, book, cell phone, cup, paper, bag, umbrella
- **Penalty:** -1.5 per item (max -10)

## 🔧 Customizing Detection

You can adjust which objects are considered "clutter" by editing `config.py`:

```python
# Current clutter objects
CLUTTER_OBJECTS = ['backpack', 'handbag', 'bottle', 'book', 'cell phone']

# Add more objects
CLUTTER_OBJECTS = [
    'backpack', 'handbag', 'bottle', 'book', 'cell phone',
    'umbrella', 'sports ball', 'teddy bear', 'laptop'  # Add these
]
```

## 📊 Detection Confidence

Objects are detected with a confidence score (0-1):
- **Default threshold:** 0.5 (50% confidence)
- **Adjust in config.py:** `CONFIDENCE_THRESHOLD = 0.5`
- **Lower (0.3):** More detections, more false positives
- **Higher (0.7):** Fewer detections, more accurate

## 💡 Tips for Better Detection

1. **Good Lighting** - Ensures clear object visibility
2. **Clear View** - Avoid obstructions
3. **Proper Distance** - Not too close, not too far
4. **Stable Camera** - Avoid blurry images
5. **Full Room View** - Capture entire classroom

## 🎨 Color Coding in Visualization

When you view the annotated image, objects are color-coded:
- 🟢 **Green** - Furniture (chairs, couches)
- 🟠 **Orange** - Tables/desks
- 🔴 **Red** - Bottles, cups (trash)
- 🔵 **Blue** - Bags (backpack, handbag)
- 🟡 **Cyan** - Books
- 🟣 **Magenta** - Cell phones

## 📝 Example Detection Output

```
📋 Detected Objects:
   • chair: 8
   • dining table: 4
   • person: 2
   • backpack: 3
   • bottle: 2
   • book: 5
   • cell phone: 1
```

## 🚀 Advanced: Custom Object Detection

If you need to detect classroom-specific objects not in COCO (like whiteboards, projectors, etc.), you can:

1. **Collect training data** - Photos of your specific objects
2. **Label the data** - Use tools like LabelImg
3. **Fine-tune YOLOv8** - Train on your custom dataset
4. **Replace model** - Update `detector.py` to use custom model

See ARCHITECTURE.md for more details on customization.
