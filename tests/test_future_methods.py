import pytest

from engine05.future_methods import FUTURE_METHODS, coordinate_mapping, wkb_hybrid, woods_saxon_table


def test_future_methods_fail_closed():
    assert set(FUTURE_METHODS) == {"coordinate_mapping", "wkb_hybrid", "woods_saxon_table"}
    assert all(status.startswith("NOT_") for status in FUTURE_METHODS.values())
    with pytest.raises(NotImplementedError):
        coordinate_mapping()
    with pytest.raises(NotImplementedError):
        wkb_hybrid()
    with pytest.raises(NotImplementedError):
        woods_saxon_table()
