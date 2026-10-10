import unittest
from train_classifier import classification_metrics


class MetricsTests(unittest.TestCase):
    def test_majority_prediction_is_not_good_macro_f1(self):
        actual = [0]*5 + [1]*4 + [2]*202 + [3]*88
        report = classification_metrics(actual, [2]*len(actual))
        self.assertGreater(report['accuracy'], .67)
        self.assertEqual(report['balanced_accuracy'], .25)
        self.assertLess(report['macro_f1'], .21)
        self.assertEqual(report['per_class']['healthy']['recall'], 0)
        self.assertEqual(report['confusion_matrix'][0][2], 5)

    def test_perfect_predictions(self):
        report = classification_metrics([0,1,2,3], [0,1,2,3])
        for metric in ['accuracy','macro_f1','balanced_accuracy']:
            self.assertEqual(report[metric], 1.)

    def test_invalid_predictions(self):
        for truth, pred in [([], []), ([0], []), ([4], [0])]:
            with self.assertRaises(ValueError):
                classification_metrics(truth, pred)


if __name__ == '__main__':
    unittest.main()
