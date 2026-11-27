import unittest
from probe import inspect

class TestSafety(unittest.TestCase):
    def test_transport_unknown_never_alert(self):
        data=inspect('Sanytol',{'offers':[{'name':'Sanytol 750 ml','price':2.0}]})
        self.assertFalse(data['offers'][0]['shipping_verified'])
        self.assertFalse(data['offers'][0]['alert_eligible'])
    def test_schema_change_fails_closed(self):
        with self.assertRaises(ValueError):
            inspect('Sanytol', {'surprise':42})
    def test_empty_is_not_an_error(self):
        self.assertEqual(inspect('Moussel',{'offers':[]})['results'],0)

if __name__=='__main__':
    unittest.main()
