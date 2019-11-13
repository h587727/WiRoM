from mavic2pro_simpleactions import * 
init()
set_altitude(2)
recognise_objects()
set_message_target('moose')
go_to_location([388, -365])
turn_left(4)
go_forward(40)
